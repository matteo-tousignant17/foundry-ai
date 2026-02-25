"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemCard } from "./problem-card";
import { ProblemForm } from "./problem-form";
import { AlertTriangle, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

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

interface ProblemListProps {
  problems: Problem[];
}

const TABS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "shaped", label: "Shaped" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function ProblemList({ problems }: ProblemListProps) {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Problem | null>(null);

  const filtered =
    filter === "all" ? problems : problems.filter((p) => p.status === filter);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
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
          description="Shape VoC signals into evidence-backed problem statements"
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
            <ProblemCard
              key={problem.id}
              problem={problem}
              onEdit={(p) => {
                setEditing(p);
                setFormOpen(true);
              }}
            />
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
    </>
  );
}
