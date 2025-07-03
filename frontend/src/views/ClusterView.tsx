import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { GetNamespacesFromCluster } from "../../wailsjs/go/main/App";

interface Props {
  clusterName: string;
  // callback into App to set the selected namespace
  onSelectNamespace: (ns: string) => void;
}

export default function ClusterView({ clusterName, onSelectNamespace }: Props) {
  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    GetNamespacesFromCluster(clusterName)
      .then(setNamespaces)
      .catch((e) => toast.error(String(e)));
  }, [clusterName]);

  return (
    <div className="space-y-2 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Namespaces in {clusterName}</h2>
      {namespaces.map((ns) => (
        <Button
          key={ns}
          variant="secondary"
          className="w-full justify-start"
          onClick={() => onSelectNamespace(ns)}
        >
          {ns}
        </Button>
      ))}
    </div>
  );
}