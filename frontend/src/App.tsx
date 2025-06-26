import "./App.css";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

import Sidebar from "./components/Sidebar";
import ClusterView from "./views/ClusterView";
import NamespaceView from "./views/NamespaceView";
import Home from "./views/Home";

import { ListClusters, AddCluster } from "../wailsjs/go/main/App";

export default function App() {
  // ── app‑level state ────────────────────────────────────────────────────
  const [clusters, setClusters] = useState<string[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | undefined>();
  const [selectedNamespace, setSelectedNamespace] = useState<string | undefined>();

  // ── helpers ────────────────────────────────────────────────────────────
  const refreshClusters = () =>
    ListClusters()
      .then(setClusters)
      .catch((e) => toast.error(String(e)));

  const handleClusterSelect = (name: string) => {
    // Toggle behaviour; selecting a new cluster clears namespace selection.
    setSelectedCluster((prev) => {
      const newVal = prev === name ? undefined : name;
      if (newVal === undefined) setSelectedNamespace(undefined);
      return newVal;
    });
  };

  const handleNamespaceSelect = (ns: string) => {
    setSelectedNamespace((prev) => (prev === ns ? undefined : ns));
  };

  const handleAddCluster = (cfg: string) =>
    AddCluster(cfg)
      .then(() => refreshClusters())
      .catch((e) => toast.error(String(e)));

  useEffect(() => {
    refreshClusters();
  }, []);

  // ── main render ────────────────────────────────────────────────────────
  let mainPane;
  if (selectedCluster && selectedNamespace) {
    mainPane = (
      <NamespaceView
        clusterName={selectedCluster}
        namespace={selectedNamespace}
      />
    );
  } else if (selectedCluster) {
    mainPane = (
      <ClusterView
        clusterName={selectedCluster}
        onSelectNamespace={handleNamespaceSelect}
      />
    );
  } else {
    mainPane = <Home />;
  }

  return (
    <div id="App" className="flex h-screen overflow-hidden">
      <Sidebar
        clusters={clusters}
        selected={selectedCluster}
        onSelect={handleClusterSelect}
        onAdd={handleAddCluster}
      />

      <main className="flex-1 overflow-y-auto p-6">{mainPane}</main>

      <Toaster position="top-right" richColors />
    </div>
  );
}