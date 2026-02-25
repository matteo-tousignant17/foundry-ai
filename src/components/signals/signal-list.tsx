"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalCard } from "./signal-card";
import { SignalForm } from "./signal-form";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

interface SignalListProps {
  signals: Signal[];
}

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "processed", label: "Processed" },
  { value: "discarded", label: "Discarded" },
];

export function SignalList({ signals }: SignalListProps) {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);

  const filtered =
    filter === "all" ? signals : signals.filter((s) => s.status === filter);

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
          icon={Inbox}
          title="No signals yet"
          description="Paste voice-of-customer feedback to get started"
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
            <SignalCard
              key={signal.id}
              signal={signal}
              onEdit={(s) => {
                setEditingSignal(s);
                setFormOpen(true);
              }}
            />
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
    </>
  );
}
