"use client";

import { useState } from "react";
import { ObjectiveCard } from "./objective-card";
import { ObjectiveForm } from "./objective-form";
import { Target, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

interface Objective {
  id: string;
  name: string;
  timeframe: string | null;
  metric: string | null;
  weight: number;
  createdAt: Date;
}

interface ObjectiveListProps {
  objectives: Objective[];
}

export function ObjectiveList({ objectives }: ObjectiveListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Objective | null>(null);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Objective
        </Button>
      </div>

      {objectives.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No objectives yet"
          description="Define strategic objectives to score roadmap items against"
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Objective
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onEdit={(o) => {
                setEditing(o);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ObjectiveForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        defaultValues={editing ?? undefined}
      />
    </>
  );
}
