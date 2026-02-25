"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { problemInsertSchema, type ProblemInsert } from "@/lib/validators/problem";
import { createProblem, updateProblem } from "@/lib/actions/problems";
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

interface ProblemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any> & { id?: string };
}

export function ProblemForm({ open, onOpenChange, defaultValues }: ProblemFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!defaultValues?.id;

  const form = useForm<ProblemInsert>({
    resolver: zodResolver(problemInsertSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      statement: defaultValues?.statement ?? "",
      whoAffected: defaultValues?.whoAffected ?? "",
      workflowBlock: defaultValues?.workflowBlock ?? "",
      businessImpact: defaultValues?.businessImpact ?? "",
      retentionOrGrowth: defaultValues?.retentionOrGrowth,
      frequency: defaultValues?.frequency,
      severity: defaultValues?.severity,
    },
  });

  function onSubmit(data: ProblemInsert) {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateProblem(defaultValues!.id!, data);
          toast.success("Problem updated");
        } else {
          await createProblem(data);
          toast.success("Problem created");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Problem" : "Add Problem"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Short problem name"
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
            <Label htmlFor="statement">Problem Statement *</Label>
            <Textarea
              id="statement"
              placeholder="When [user] tries to [action], they [pain] because [cause]..."
              className="mt-1 min-h-[100px]"
              {...form.register("statement")}
            />
            {form.formState.errors.statement && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.statement.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whoAffected">Who Affected</Label>
              <Input
                id="whoAffected"
                placeholder="e.g. Enterprise admins"
                className="mt-1"
                {...form.register("whoAffected")}
              />
            </div>
            <div>
              <Label htmlFor="workflowBlock">Workflow Block</Label>
              <Input
                id="workflowBlock"
                placeholder="e.g. Onboarding flow"
                className="mt-1"
                {...form.register("workflowBlock")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessImpact">Business Impact</Label>
            <Input
              id="businessImpact"
              placeholder="e.g. 15% of trial users drop off"
              className="mt-1"
              {...form.register("businessImpact")}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Impact Area</Label>
              <Select
                value={form.watch("retentionOrGrowth") ?? ""}
                onValueChange={(v) =>
                  form.setValue("retentionOrGrowth", v as ProblemInsert["retentionOrGrowth"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retention">Retention</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select
                value={form.watch("severity") ?? ""}
                onValueChange={(v) =>
                  form.setValue("severity", v as ProblemInsert["severity"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={form.watch("frequency") ?? ""}
                onValueChange={(v) =>
                  form.setValue("frequency", v as ProblemInsert["frequency"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Add Problem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
