package main

import (
	"context"
	"os"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// KubeService wraps a *kubernetes.Clientset that is built from a single
// kubeconfig file (for now we just support one per service instance).
type KubeService struct {
	Client *kubernetes.Clientset
}

// NewKubeService returns a ready-to-use KubeService.  The first non-empty value
// in   (1) kubeconfigPath arg, (2) $KUBECONFIG, (3) ~/.kube/config   is used.
// If no file exists or cannot be loaded an error is returned.
func NewKubeService(kubeconfigPath ...string) (*KubeService, error) {
	// Decide which kubeconfig path to use
	path := ""
	if len(kubeconfigPath) > 0 && kubeconfigPath[0] != "" {
		path = kubeconfigPath[0]
	} else if env := os.Getenv("KUBECONFIG"); env != "" {
		path = env
	} else {
		home, _ := os.UserHomeDir()
		path = filepath.Join(home, ".kube", "config")
	}

	// Build *rest.Config then *Clientset
	cfg, err := clientcmd.BuildConfigFromFlags("", path)
	if err != nil {
		return nil, err
	}
	client, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}

	return &KubeService{Client: client}, nil
}

// GetNamespaces returns the names of all namespaces visible in the cluster.
func (ks *KubeService) GetNamespaces(ctx context.Context) ([]string, error) {
	list, err := ks.Client.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	out := make([]string, len(list.Items))
	for i, ns := range list.Items {
		out[i] = ns.Name
	}
	return out, nil
}

// ListDeploymentNames returns the names of all Deployments in the given ns.
func (ks *KubeService) ListDeploymentNames(ctx context.Context, namespace string) ([]string, error) {
	dList, err := ks.Client.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	out := make([]string, len(dList.Items))
	for i, d := range dList.Items {
		out[i] = d.Name
	}
	return out, nil
}

// ListStatefulSetNames returns the names of StatefulSets in the namespace.
func (ks *KubeService) ListStatefulSetNames(ctx context.Context, namespace string) ([]string, error) {
	ssList, err := ks.Client.AppsV1().StatefulSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	out := make([]string, len(ssList.Items))
	for i, ss := range ssList.Items {
		out[i] = ss.Name
	}
	return out, nil
}
