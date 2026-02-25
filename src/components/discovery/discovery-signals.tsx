"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Plus,
  Radio,
} from "lucide-react";
import { updateSignal, deleteSignal } from "@/lib/actions/signals";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SignalForm } from "@/components/signals/signal-form";
import { SignalAnalysis } from "@/components/signals/signal-analysis";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Types ──────────────────────────────────────────────

interface Signal {
  id: string;
  rawText: string;
  source: string | null;
  sourceUrl: string | null;
  customer: string | null;
  arr: string | null;
  severity: string | null;
  frequency: string | null;
  renewalRisk: string | null;
  status: string;
  createdAt: Date;
}

const SOURCE_COLORS: Record<string, string> = {
  support: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sales: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  research:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  gong: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  zendesk: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  email: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  slack: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "processed", label: "Processed" },
  { value: "discarded", label: "Discarded" },
];

// ─── Component ──────────────────────────────────────────

export function DiscoverySignals({ signals }: { signals: Signal[] }) {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const [analysisSignalId, setAnalysisSignalId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered =
    filter === "all" ? signals : signals.filter((s) => s.status === filter);

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateSignal(id, { status });
      toast.success(`Signal marked as ${status}`);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSignal(id);
      toast.success("Signal deleted");
      setDeletingId(null);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {tab.value !== "all" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({signals.filter((s) => s.status === tab.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Signal
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No signals yet"
          description="Capture raw observations — customer feedback, data anomalies, sales requests"
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Signal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((signal) => (
            <Card key={signal.id} className="group relative">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {signal.source && (
                    <Badge
                      variant="outline"
                      className={SOURCE_COLORS[signal.source] ?? ""}
                    >
                      {signal.source}
                    </Badge>
                  )}
                  {signal.severity && (
                    <Badge
                      variant="outline"
                      className={SEVERITY_COLORS[signal.severity] ?? ""}
                    >
                      {signal.severity}
                    </Badge>
                  )}
                  {signal.customer && (
                    <span className="text-xs text-muted-foreground">
                      {signal.customer}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAnalysisSignalId(signal.id)}
                    title="Analyze with AI"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setAnalysisSignalId(signal.id)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingSignal(signal);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(signal.id, "processed")
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Processed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(signal.id, "discarded")
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Discard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletingId(signal.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 text-sm whitespace-pre-wrap">
                  {signal.rawText}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  {signal.arr && <span>ARR: {signal.arr}</span>}
                  <span>
                    {new Date(signal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SignalForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSignal(null);
        }}
        defaultValues={editingSignal ?? undefined}
      />

      {analysisSignalId && (
        <SignalAnalysis
          signalId={analysisSignalId}
          open={!!analysisSignalId}
          onOpenChange={(open) => {
            if (!open) setAnalysisSignalId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Delete Signal"
        description="This will permanently delete this signal and remove it from any linked problems."
        onConfirm={() => deletingId && handleDelete(deletingId)}
        loading={pending}
      />
    </>
  );
}
