"use client";

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
import { MoreHorizontal, Pencil, Trash2, MessageSquare } from "lucide-react";
import { deleteProblem, updateProblem } from "@/lib/actions/problems";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

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

interface ProblemCardProps {
  problem: Problem;
  onEdit: (p: Problem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  shaped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  proposed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function ProblemCard({ problem, onEdit }: ProblemCardProps) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteProblem(problem.id);
      toast.success("Problem deleted");
      setConfirmDelete(false);
    });
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateProblem(problem.id, { status });
      if ("error" in result && result.error === "gating") {
        toast.error(result.message, {
          action: {
            label: "Add links",
            onClick: () => window.location.assign(`/problems/${problem.id}`),
          },
        });
      } else {
        toast.success(`Status changed to ${status}`);
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/problems/${problem.id}`}
              className="font-semibold hover:underline"
            >
              {problem.title}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className={STATUS_COLORS[problem.status] ?? ""}>
                {problem.status}
              </Badge>
              {problem.severity && (
                <Badge variant="outline">{problem.severity}</Badge>
              )}
              {problem.signalProblems.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {problem.signalProblems.length} signal{problem.signalProblems.length !== 1 ? "s" : ""}
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
              <DropdownMenuItem onClick={() => onEdit(problem)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange("shaped")}>
                Mark Shaped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("accepted")}>
                Accept
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                Reject
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
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {problem.statement}
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Problem"
        description="This will permanently delete this problem and all its signal links."
        onConfirm={handleDelete}
        loading={pending}
      />
    </>
  );
}
