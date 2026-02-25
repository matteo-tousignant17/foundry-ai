"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { objectiveInsertSchema, type ObjectiveInsert } from "@/lib/validators/objective";
import { createObjective, updateObjective } from "@/lib/actions/objectives";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTransition } from "react";

interface ObjectiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any> & { id?: string };
}

export function ObjectiveForm({ open, onOpenChange, defaultValues }: ObjectiveFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!defaultValues?.id;

  const form = useForm<ObjectiveInsert>({
    resolver: zodResolver(objectiveInsertSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      timeframe: defaultValues?.timeframe ?? "",
      metric: defaultValues?.metric ?? "",
      weight: defaultValues?.weight ?? 1.0,
    },
  });

  function onSubmit(data: ObjectiveInsert) {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateObjective(defaultValues!.id!, data);
          toast.success("Objective updated");
        } else {
          await createObjective(data);
          toast.success("Objective created");
        }
        form.reset();
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Objective" : "Add Objective"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder='e.g. "Reduce churn by 20%"'
              className="mt-1"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Input
                id="timeframe"
                placeholder="Q1-2026"
                className="mt-1"
                {...form.register("timeframe")}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                className="mt-1"
                {...form.register("weight", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="metric">Key Metric</Label>
            <Input
              id="metric"
              placeholder='e.g. "NRR > 95%"'
              className="mt-1"
              {...form.register("metric")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Add Objective"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
