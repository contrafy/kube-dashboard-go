package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx  context.Context
	kube *KubeService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	ks, err := NewKubeService() // default kubeconfig resolution
	if err != nil {
		// Bubble the error to the frontend later; for now just log
		fmt.Printf("KubeService init error: %v\n", err)
	} else {
		a.kube = ks
	}
}

func (a *App) GetNamespaces() ([]string, error) {
	if a.kube == nil {
		return nil, fmt.Errorf("kube service not initialised or kubeconfig not found")
	}
	return a.kube.GetNamespaces(a.ctx)
}
