import "./App.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import Sidebar from "./components/Sidebar";
import ClusterView from "./views/ClusterView";
import Home from "./views/Home";

import {
  ListClusters,
  AddCluster,
} from "../wailsjs/go/main/App";

export default function App() {
  // ── state ────────────────────────────────────────────────────────────
  const [clusters, setClusters] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // ── helpers ──────────────────────────────────────────────────────────
  const refreshClusters = () =>
    ListClusters()
      .then(setClusters)
      .catch((e) => toast.error(String(e)));

  const handleSelect = (name: string) => {
    // toggle logic: clicking again unselects
    setSelected((prev) => (prev === name ? undefined : name));
  };

  const handleAdd = (cfg: string) =>
    AddCluster(cfg)
      .then(() => refreshClusters())
      .catch((e) => toast.error(String(e)));

  // ── effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    refreshClusters();
  }, []);

  // ── layout ───────────────────────────────────────────────────────────
  return (
    <div id="App" className="flex h-screen overflow-hidden">
      {/* Sidebar – fixed width, full height */}
      <Sidebar
        clusters={clusters}
        selected={selected}
        onSelect={handleSelect}
        onAdd={handleAdd}
      />

      {/* Main pane – flex‑1 so it fills remaining space */}
      <main className="flex-1 overflow-y-auto p-6">
        {selected ? <ClusterView clusterName={selected} /> : <Home />}
      </main>

      {/* Global toast notifications (top‑right) */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
