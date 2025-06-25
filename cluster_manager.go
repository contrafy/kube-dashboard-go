package main

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/clientcmd"
	clientapi "k8s.io/client-go/tools/clientcmd/api"
)

const dashboardDirName = ".dashboard"

// ClusterInfo keeps everything we care about for a single cluster.
type ClusterInfo struct {
	Name    string
	Path    string
	Service *KubeService
}

// ---------- helpers ----------

func kubeDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".kube"), nil
}

func dashboardDir() (string, error) {
	kd, err := kubeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(kd, dashboardDirName), nil
}

func ensureDashboardDir() (string, error) {
	dir, err := dashboardDir()
	if err != nil {
		return "", err
	}
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err = os.MkdirAll(dir, 0o700)
	}
	return dir, err
}

func extractClusterName(cfg *clientapi.Config) string {
	if ctx, ok := cfg.Contexts[cfg.CurrentContext]; ok && ctx.Cluster != "" {
		return ctx.Cluster
	}
	if cfg.CurrentContext != "" {
		return cfg.CurrentContext
	}
	return "cluster-" + uuid.NewString()
}

func clusterNameFromBytes(b []byte) (string, error) {
	cfg, err := clientcmd.Load(b)
	if err != nil {
		return "", err
	}
	return extractClusterName(cfg), nil
}

// ---------- App-level helpers ----------

func (a *App) loadExistingClusters() error {
	dir, err := ensureDashboardDir()
	if err != nil {
		return err
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		p := filepath.Join(dir, e.Name())
		svc, err := NewKubeService(p)
		if err != nil {
			fmt.Printf("Skipping %s: %v\n", p, err)
			continue
		}
		name, _ := clusterNameFromBytes(readFileNoErr(p))
		a.clusters[name] = &ClusterInfo{
			Name:    name,
			Path:    p,
			Service: svc,
		}
	}
	return nil
}

func readFileNoErr(p string) []byte {
	b, _ := os.ReadFile(p)
	return b
}

func (a *App) maybeCopyDefaultConfig() {
	kd, _ := kubeDir()
	defaultCfg := filepath.Join(kd, "config")
	if _, err := os.Stat(defaultCfg); err != nil {
		return // no default config
	}

	raw := readFileNoErr(defaultCfg)
	name, err := clusterNameFromBytes(raw)
	if err != nil {
		return
	}
	if _, exists := a.clusters[name]; exists {
		return // already added
	}

	dir, _ := dashboardDir()
	dest := filepath.Join(dir, name+".yaml")
	_ = os.WriteFile(dest, raw, 0o600)

	svc, err := NewKubeService(dest)
	if err != nil {
		fmt.Printf("Default kubeconfig present but unusable: %v\n", err)
		return
	}
	a.clusters[name] = &ClusterInfo{
		Name:    name,
		Path:    dest,
		Service: svc,
	}
}

// ---------- methods exported to frontend ----------

// ListClusters returns cluster names in insertion order.
func (a *App) ListClusters() []string {
	out := make([]string, 0, len(a.clusters))
	for name := range a.clusters {
		out = append(out, name)
	}
	return out
}

// AddCluster stores the given kubeconfig string, makes a KubeService and
// returns the cluster name.
func (a *App) AddCluster(kubeconfig string) (string, error) {
	name, err := clusterNameFromBytes([]byte(kubeconfig))
	if err != nil {
		return "", err
	}
	if _, exists := a.clusters[name]; exists {
		return name, nil // already present
	}

	dir, err := ensureDashboardDir()
	if err != nil {
		return "", err
	}
	dest := filepath.Join(dir, name+".yaml")
	if err := os.WriteFile(dest, []byte(kubeconfig), fs.FileMode(0o600)); err != nil {
		return "", err
	}

	svc, err := NewKubeService(dest)
	if err != nil {
		return "", err
	}

	a.clusters[name] = &ClusterInfo{
		Name:    name,
		Path:    dest,
		Service: svc,
	}
	return name, nil
}

// GetNamespacesFromCluster exposes namespaces for a specific cluster.
func (a *App) GetNamespacesFromCluster(clusterName string) ([]string, error) {
	ci, ok := a.clusters[clusterName]
	if !ok {
		return nil, fmt.Errorf("cluster %q not found", clusterName)
	}
	list, err := ci.Service.Client.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	out := make([]string, len(list.Items))
	for i, ns := range list.Items {
		out[i] = ns.Name
	}
	return out, nil
}
