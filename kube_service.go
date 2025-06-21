package main

import (
	"context"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

type KubeService struct {
	app       *application.App
	clientset *kubernetes.Clientset
}

// factory used in main.go
func NewKubeService(app *application.App, kubeconfigPath string) (*KubeService, error) {
	if kubeconfigPath == "" {
		if h := homedir.HomeDir(); h != "" {
			kubeconfigPath = filepath.Join(h, ".kube", "config")
		}
	}
	cfg, err := clientcmd.BuildConfigFromFlags("", kubeconfigPath)
	if err != nil {
		return nil, err
	}
	cs, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}

	svc := &KubeService{app: app, clientset: cs}
	go svc.runPoller() // start background loop
	return svc, nil
}

// PodCount is callable from JS bindings
func (k *KubeService) PodCount() (int, error) {
	pods, err := k.clientset.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return 0, err
	}
	return len(pods.Items), nil
}

// --- private helpers ---

func (k *KubeService) runPoller() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		cnt, err := k.PodCount()
		if err != nil {
			// optional: emit an error event or log
			continue
		}
		k.app.EmitEvent("pod-count", cnt)
	}
}
