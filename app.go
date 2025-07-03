package main

import (
	"context"
)

// App struct
type App struct {
	ctx      context.Context
	clusters map[string]*ClusterInfo
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		clusters: make(map[string]*ClusterInfo),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	a.loadExistingClusters()
	a.maybeCopyDefaultConfig()
}
