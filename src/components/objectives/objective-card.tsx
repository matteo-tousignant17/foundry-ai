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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteObjective } from "@/lib/actions/objectives";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface Objective {
  id: string;
  name: string;
  timeframe: string | null;
  metric: string | null;
  weight: number;
  createdAt: Date;
}

interface ObjectiveCardProps {
  objective: Objective;
  onEdit: (obj: Objective) => void;
}

export function ObjectiveCard({ objective, onEdit }: ObjectiveCardProps) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteObjective(objective.id);
      toast.success("Objective deleted");
      setConfirmDelete(false);
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <h3 className="font-semibold">{objective.name}</h3>
            {objective.timeframe && (
              <p className="text-xs text-muted-foreground">{objective.timeframe}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              w: {objective.weight.toFixed(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(objective)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
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
        {objective.metric && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{objective.metric}</p>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Objective"
        description="This will permanently delete this objective."
        onConfirm={handleDelete}
        loading={pending}
      />
    </>
  );
}
