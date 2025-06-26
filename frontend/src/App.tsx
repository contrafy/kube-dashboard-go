import "./App.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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

  const refreshClusters = () =>
    ListClusters()
      .then(setClusters)
      .catch((e) => toast.error(String(e)));

  // ── helper: select / toggle cluster ───────────────────────────────
  const handleClusterSelect = (name: string) => {
    setSelectedCluster(prev => {
      if (prev === name) {
        // clicked the same cluster ⇒ go “Home”
        setSelectedNamespace(undefined);
        return undefined;
      }
      // switched clusters ⇒ clear namespace selection
      setSelectedNamespace(undefined);
      return name;
    });
  };

  const handleNamespaceSelect = (ns: string) => {
    setSelectedNamespace((prev) => (prev === ns ? undefined : ns));
  };

  const handleAddCluster = (cfg: string) =>
    AddCluster(cfg)
      .then(() => refreshClusters())
      .catch((e) => toast.error(String(e)));

  const handleBack = () => setSelectedNamespace(undefined);   

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
        onBack={handleBack}
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