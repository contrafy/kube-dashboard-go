import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  clusters: string[];
  selected?: string;
  onSelect: (name: string) => void;
  onAdd: (kubeconfig: string) => void;
}

export default function Sidebar({
  clusters,
  selected,
  onSelect,
  onAdd,
}: Props) {
  // local state only for Add‑Cluster dialog
  const [open, setOpen] = useState(false);
  const [cfgText, setCfgText] = useState("\\");

  const handleSave = () => {
    onAdd(cfgText);
    setCfgText("\\");
    setOpen(false);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Scroll area for cluster list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {clusters.map((c) => (
          <Button
            key={c}
            variant={c === selected ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => onSelect(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Add‑Cluster action, pinned bottom */}
      <div className="p-4 border-t border-border">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              + Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Paste kubeconfig</DialogTitle>
            </DialogHeader>
            <Textarea
              className="h-40"
              value={cfgText}
              onChange={(e) => setCfgText(e.target.value)}
              placeholder="apiVersion: v1\nkind: Config..."
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}