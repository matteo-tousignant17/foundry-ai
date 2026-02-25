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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { deletePrd } from "@/lib/actions/prds";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface Prd {
  id: string;
  title: string;
  status: string;
  roadmapItem: { id: string; title: string } | null;
  createdAt: Date;
}

interface PrdCardProps {
  prd: Prd;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function PrdCard({ prd }: PrdCardProps) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deletePrd(prd.id);
      toast.success("PRD deleted");
      setConfirmDelete(false);
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <Link
              href={`/prds/${prd.id}`}
              className="font-semibold hover:underline"
            >
              {prd.title}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className={STATUS_COLORS[prd.status] ?? ""}>
                {prd.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/prds/${prd.id}`}>Open</Link>
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
          {prd.roadmapItem && (
            <p className="text-xs text-muted-foreground">
              Linked to: {prd.roadmapItem.title}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(prd.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete PRD"
        description="This will permanently delete this PRD and all its content."
        onConfirm={handleDelete}
        loading={pending}
      />
    </>
  );
}
