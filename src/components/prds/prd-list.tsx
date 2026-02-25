"use client";

import { useState } from "react";
import { PrdCard } from "./prd-card";
import { PrdForm } from "./prd-form";
import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

interface Prd {
  id: string;
  title: string;
  status: string;
  roadmapItem: { id: string; title: string } | null;
  createdAt: Date;
}

interface PrdListProps {
  prds: Prd[];
  roadmapItems: { id: string; title: string }[];
}

export function PrdList({ prds, roadmapItems }: PrdListProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create PRD
        </Button>
      </div>

      {prds.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No PRDs yet"
          description="Create product requirement documents from your roadmap items"
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create PRD
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prds.map((prd) => (
            <PrdCard key={prd.id} prd={prd} />
          ))}
        </div>
      )}

      <PrdForm
        open={formOpen}
        onOpenChange={setFormOpen}
        roadmapItems={roadmapItems}
      />
    </>
  );
}
