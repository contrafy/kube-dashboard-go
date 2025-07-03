import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { GetResourcesFromNamespace } from "../../wailsjs/go/main/App";

interface NamespaceResources {
  deployments: string[];
  statefulsets: string[];
  secrets: string[];
}

interface Props {
  clusterName: string;
  namespace:   string;
  onBack:      () => void;
}

export default function NamespaceView({ clusterName, namespace, onBack }: Props) {
  const [resources, setResources] = useState<NamespaceResources | null>(null);

  useEffect(() => {
    GetResourcesFromNamespace(clusterName, namespace)
      .then(setResources)
      .catch((e) => toast.error(String(e)));
  }, [clusterName, namespace]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          ←
        </Button>

        <h2 className="text-2xl font-bold whitespace-nowrap">
          {clusterName} / {namespace}
        </h2>
      </header>

      {resources ? (
        <>
            {/* Deployments */}
            <section>
            <h3 className="text-lg font-semibold mb-2">Deployments</h3>
            {resources.deployments.length > 0 ? (
                <div className="space-y-2">
                {resources.deployments.map((d) => (
                    <Button key={d} variant="outline" className="w-full justify-start">
                    {d}
                    </Button>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No deployments found.</p>
            )}
            </section>

            {/* StatefulSets */}
            <section>
            <h3 className="text-lg font-semibold mb-2">StatefulSets</h3>
            {resources.statefulsets.length > 0 ? (
                <div className="space-y-2">
                {resources.statefulsets.map((s) => (
                    <Button key={s} variant="outline" className="w-full justify-start">
                    {s}
                    </Button>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No statefulsets found.</p>
            )}
            </section>

            {/* Secrets */}
            <section>
            <h3 className="text-lg font-semibold mb-2">Secrets</h3>
            {resources.secrets.length > 0 ? (
                <div className="space-y-2">
                {resources.secrets.map((sec) => (
                    <Button key={sec} variant="outline" className="w-full justify-start">
                    {sec}
                    </Button>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No secrets found.</p>
            )}
            </section>
        </>
        ) : (
        <p>Loading resources…</p>
        )}
    </div>
  );
}