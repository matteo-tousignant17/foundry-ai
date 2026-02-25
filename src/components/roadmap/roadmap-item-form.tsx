"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  roadmapItemInsertSchema,
  type RoadmapItemInsert,
} from "@/lib/validators/roadmap-item";
import { createRoadmapItem, updateRoadmapItem } from "@/lib/actions/roadmap-items";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTransition } from "react";

interface RoadmapItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any> & { id?: string };
  initiatives?: { id: string; title: string }[];
  epics?: { id: string; title: string }[];
  releases?: { id: string; name: string }[];
}

const STATUSES = [
  { value: "proposed", label: "Proposed" },
  { value: "committed", label: "Committed" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const EFFORT_SIZES = ["XS", "S", "M", "L", "XL"];

export function RoadmapItemForm({
  open,
  onOpenChange,
  defaultValues,
  initiatives,
  epics,
  releases,
}: RoadmapItemFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!defaultValues?.id;

  const form = useForm<RoadmapItemInsert>({
    resolver: zodResolver(roadmapItemInsertSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      rationale: defaultValues?.rationale ?? "",
      type: defaultValues?.type ?? "feature",
      status: defaultValues?.status ?? "proposed",
      targetMonth: defaultValues?.targetMonth ?? "",
      effortSize: defaultValues?.effortSize,
      reach: defaultValues?.reach,
      impact: defaultValues?.impact,
      confidence: defaultValues?.confidence,
      effort: defaultValues?.effort,
      parentId: defaultValues?.parentId ?? "",
      releaseId: defaultValues?.releaseId ?? "",
    },
  });

  function onSubmit(data: RoadmapItemInsert) {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateRoadmapItem(defaultValues!.id!, data);
          toast.success("Roadmap item updated");
        } else {
          await createRoadmapItem(data);
          toast.success("Roadmap item created");
        }
        form.reset();
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  const selectedType = form.watch("type");
  const reach = form.watch("reach");
  const impact = form.watch("impact");
  const confidence = form.watch("confidence");
  const effort = form.watch("effort");
  const previewScore =
    reach && impact && confidence && effort
      ? Math.round(((reach * impact * confidence) / effort) * 10) / 10
      : null;

  // Context-aware parent options
  const parentOptions =
    selectedType === "epic"
      ? initiatives ?? []
      : selectedType === "feature"
        ? epics ?? []
        : [];
  const parentLabel =
    selectedType === "epic"
      ? "Parent Initiative"
      : selectedType === "feature"
        ? "Parent Epic"
        : "";

  function handleTypeChange(v: string) {
    form.setValue("type", v as RoadmapItemInsert["type"]);
    // Clear parentId when type changes to avoid stale references
    form.setValue("parentId", "");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Roadmap Item" : "Add Roadmap Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Feature, epic, or initiative name"
              className="mt-1"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What and why..."
              className="mt-1"
              {...form.register("description")}
            />
          </div>

          <div>
            <Label htmlFor="rationale">Rationale</Label>
            <Textarea
              id="rationale"
              placeholder="Why this item matters..."
              className="mt-1"
              {...form.register("rationale")}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={selectedType ?? "feature"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initiative">Initiative</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.watch("status") ?? "proposed"}
                onValueChange={(v) =>
                  form.setValue("status", v as RoadmapItemInsert["status"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetMonth">Target Month</Label>
              <Input
                id="targetMonth"
                type="month"
                className="mt-1"
                {...form.register("targetMonth")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Effort Size</Label>
              <Select
                value={form.watch("effortSize") ?? ""}
                onValueChange={(v) =>
                  form.setValue("effortSize", v as RoadmapItemInsert["effortSize"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="T-shirt" />
                </SelectTrigger>
                <SelectContent>
                  {EFFORT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {parentOptions.length > 0 && (
              <div>
                <Label>{parentLabel}</Label>
                <Select
                  value={form.watch("parentId") ?? ""}
                  onValueChange={(v) => form.setValue("parentId", v || undefined)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {"title" in i ? i.title : (i as { name: string }).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {releases && releases.length > 0 && (
            <div>
              <Label>Release</Label>
              <Select
                value={form.watch("releaseId") ?? ""}
                onValueChange={(v) => form.setValue("releaseId", v || undefined)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="No release" />
                </SelectTrigger>
                <SelectContent>
                  {releases.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>RICE Score</Label>
              {previewScore !== null && (
                <span className="text-sm font-mono font-medium">
                  = {previewScore}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="reach" className="text-xs">
                  Reach (1-10)
                </Label>
                <Input
                  id="reach"
                  type="number"
                  min="1"
                  max="10"
                  className="mt-1"
                  {...form.register("reach", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="impact" className="text-xs">
                  Impact (1-10)
                </Label>
                <Input
                  id="impact"
                  type="number"
                  min="1"
                  max="10"
                  className="mt-1"
                  {...form.register("impact", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="confidence" className="text-xs">
                  Confidence (1-10)
                </Label>
                <Input
                  id="confidence"
                  type="number"
                  min="1"
                  max="10"
                  className="mt-1"
                  {...form.register("confidence", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="effort" className="text-xs">
                  Effort (1-10)
                </Label>
                <Input
                  id="effort"
                  type="number"
                  min="1"
                  max="10"
                  className="mt-1"
                  {...form.register("effort", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
