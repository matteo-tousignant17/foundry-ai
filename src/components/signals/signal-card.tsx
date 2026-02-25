"use client";

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
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { updateSignal, deleteSignal } from "@/lib/actions/signals";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SignalAnalysis } from "./signal-analysis";

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

interface SignalCardProps {
  signal: Signal;
  onEdit: (signal: Signal) => void;
}

const SOURCE_COLORS: Record<string, string> = {
  gong: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  zendesk: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  email: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  slack: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function SignalCard({ signal, onEdit }: SignalCardProps) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateSignal(signal.id, { status });
      toast.success(`Signal marked as ${status}`);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSignal(signal.id);
      toast.success("Signal deleted");
      setConfirmDelete(false);
    });
  }

  return (
    <>
      <Card className="group relative">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            {signal.source && (
              <Badge variant="outline" className={SOURCE_COLORS[signal.source] ?? ""}>
                {signal.source}
              </Badge>
            )}
            {signal.severity && (
              <Badge variant="outline">{signal.severity}</Badge>
            )}
            {signal.customer && (
              <span className="text-xs text-muted-foreground">{signal.customer}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setAnalysisOpen(true)}
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
                <DropdownMenuItem onClick={() => setAnalysisOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(signal)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("processed")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Processed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("discarded")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Discard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
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
            <span>{new Date(signal.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <SignalAnalysis
        signalId={signal.id}
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Signal"
        description="This will permanently delete this signal and remove it from any linked problems."
        onConfirm={handleDelete}
        loading={pending}
      />
    </>
  );
}
