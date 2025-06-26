import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { GetNamespacesFromCluster } from "../../wailsjs/go/main/App";

interface Props {
  clusterName: string;
}

export default function ClusterView({ clusterName }: Props) {
  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    GetNamespacesFromCluster(clusterName)
      .then(setNamespaces)
      .catch((e) => toast.error(String(e)));
  }, [clusterName]);

  return (
    <div className="space-y-2">
      <Toaster />
      <h2 className="text-xl font-semibold">Namespaces in {clusterName}</h2>
      <ul className="list-disc list-inside">
        {namespaces.map((ns) => (
          <li key={ns}>{ns}</li>
        ))}
      </ul>
    </div>
  );
}