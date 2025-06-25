package main

import (
	"context"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

// KubeService streams pod-counts to the frontend
type KubeService struct {
	ctx       context.Context
	clientset *kubernetes.Clientset
}

// NewKubeService constructs a clientset from the local kubeconfig
func NewKubeService() (*KubeService, error) {
	kc := filepath.Join(homedir.HomeDir(), ".kube", "config")
	cfg, err := clientcmd.BuildConfigFromFlags("", kc)
	if err != nil {
		return nil, err
	}
	cs, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}
	return &KubeService{clientset: cs}, nil
}

// --- Wails lifecycle hooks ---

// Startup is automatically called by Wails
func (k *KubeService) Startup(ctx context.Context) {
	k.ctx = ctx
	go k.poll() // start background loop
}

// --- Methods callable from JS bindings ---

// PodCount returns the current number of pods in the cluster
func (k *KubeService) PodCount() (int, error) {
	pods, err := k.clientset.CoreV1().Pods("").List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return 0, err
	}
	return len(pods.Items), nil
}

// --- internal helpers ---

func (k *KubeService) poll() {
	t := time.NewTicker(5 * time.Second)
	defer t.Stop()

	for range t.C {
		if k.ctx == nil {
			continue
		}
		cnt, err := k.PodCount()
		if err != nil {
			// emit an error event instead if you like
			continue
		}
		runtime.EventsEmit(k.ctx, "pod-count", cnt)
	}
}
