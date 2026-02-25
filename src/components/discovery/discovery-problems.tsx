"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  MessageSquare,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { deleteProblem, updateProblem } from "@/lib/actions/problems";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ProblemForm } from "@/components/problems/problem-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Types ──────────────────────────────────────────────

interface Problem {
  id: string;
  title: string;
  statement: string;
  status: string;
  severity: string | null;
  frequency: string | null;
  signalProblems: { id: string }[];
  createdAt: Date;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  shaped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  proposed:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  accepted:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const TABS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "shaped", label: "Shaped" },
  { value: "proposed", label: "Proposed" },
  { value: "accepted", label: "Accepted" },
];

// ─── Component ──────────────────────────────────────────

export function DiscoveryProblems({ problems }: { problems: Problem[] }) {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Problem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered =
    filter === "all" ? problems : problems.filter((p) => p.status === filter);

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateProblem(id, { status });
      if ("error" in result && result.error === "gating") {
        toast.error(result.message, {
          action: {
            label: "Add links",
            onClick: () => window.location.assign(`/problems/${id}`),
          },
        });
      } else {
        toast.success(`Status changed to ${status}`);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProblem(id);
      toast.success("Problem deleted");
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
                    ({problems.filter((p) => p.status === tab.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Problem
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No problems yet"
          description="Translate signals into validated problem statements with evidence"
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Problem
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((problem) => (
            <Card key={problem.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {problem.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[problem.status] ?? ""}
                    >
                      {problem.status}
                    </Badge>
                    {problem.severity && (
                      <Badge variant="outline">{problem.severity}</Badge>
                    )}
                    {problem.signalProblems.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {problem.signalProblems.length} signal
                        {problem.signalProblems.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(problem);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(problem.id, "shaped")}
                    >
                      Mark Shaped
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(problem.id, "proposed")}
                    >
                      Mark Proposed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(problem.id, "accepted")}
                    >
                      Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(problem.id, "rejected")}
                    >
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeletingId(problem.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {problem.statement}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProblemForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        defaultValues={editing ?? undefined}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Delete Problem"
        description="This will permanently delete this problem and all its signal links."
        onConfirm={() => deletingId && handleDelete(deletingId)}
        loading={pending}
      />
    </>
  );
}
