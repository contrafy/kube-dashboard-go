import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GetWorkloadsFromNamespace } from "../../wailsjs/go/main/App";

interface WorkloadResp {
  deployments: string[];
  statefulsets: string[];
}

interface Props {
  clusterName: string;
  namespace: string;
}

export default function NamespaceView({ clusterName, namespace }: Props) {
  const [workloads, setWorkloads] = useState<WorkloadResp | null>(null);

  useEffect(() => {
    GetWorkloadsFromNamespace(clusterName, namespace)
      .then((resp) => setWorkloads({
        deployments: resp.deployments ?? [],
        statefulsets: resp.statefulsets ?? [],
      }))
      .catch((e) => toast.error(String(e)));
  }, [clusterName, namespace]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold">
          {clusterName} / {namespace}
        </h2>
      </header>

      {workloads ? (
        <>
          {/* Deployments */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Deployments</h3>
            {workloads.deployments.length > 0 ? (
              <ul className="list-disc list-inside">
                {workloads.deployments.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No deployments found.</p>
            )}
          </section>

          {/* StatefulSets */}
          <section>
            <h3 className="text-lg font-semibold mb-2">StatefulSets</h3>
            {workloads.statefulsets.length > 0 ? (
              <ul className="list-disc list-inside">
                {workloads.statefulsets.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No statefulsets found.</p>
            )}
          </section>
        </>
      ) : (
        <p>Loading workloads…</p>
      )}
    </div>
  );
}