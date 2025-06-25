import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import {
  ListClusters,
  AddCluster,
  GetNamespacesFromCluster,
} from "../../wailsjs/go/main/App"

export default function Clusters() {
  const [clusters, setClusters] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [cfgText, setCfgText] = useState("")
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [err, setErr] = useState("")

  const refresh = () => ListClusters().then(setClusters)

  useEffect(() => {
    refresh()
  }, [])

  const handleAdd = () => {
    AddCluster(cfgText)
      .then(() => {
        setCfgText("")
        setOpen(false)
        refresh()
      })
      .catch(e => setErr(String(e)))
  }

  const loadNS = (c: string) =>
    GetNamespacesFromCluster(c)
      .then(setNamespaces)
      .catch(e => setErr(String(e)))

  return (
    <div className="flex h-screen flex-col items-center justify-start p-6 gap-4">
      {/* cluster buttons */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {clusters.map(c => (
          <Button key={c} variant="secondary" onClick={() => loadNS(c)}>
            {c}
          </Button>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">+ Add Cluster</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Paste kubeconfig</DialogTitle>
            </DialogHeader>
            <Textarea
              className="h-40"
              value={cfgText}
              onChange={e => setCfgText(e.target.value)}
              placeholder="---\napiVersion: v1\nkind: Config\n..."
            />
            <DialogFooter>
              <Button onClick={handleAdd}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* namespaces preview (optional) */}
      {namespaces.length > 0 && (
        <div className="mt-4 w-full max-w-xs text-left">
          <p className="font-semibold mb-1">Namespaces:</p>
          <ul className="list-disc list-inside">
            {namespaces.map(ns => (
              <li key={ns}>{ns}</li>
            ))}
          </ul>
        </div>
      )}

      {err && <p className="text-red-500">{err}</p>}
    </div>
  )
}
