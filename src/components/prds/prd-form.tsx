"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prdInsertSchema, type PrdInsert } from "@/lib/validators/prd";
import { createPrd } from "@/lib/actions/prds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PrdFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapItems: { id: string; title: string }[];
}

export function PrdForm({ open, onOpenChange, roadmapItems }: PrdFormProps) {
  const [pending, startTransition] = useTransition();

  const form = useForm<PrdInsert>({
    resolver: zodResolver(prdInsertSchema),
    defaultValues: {
      title: "",
      roadmapItemId: "",
    },
  });

  function onSubmit(data: PrdInsert) {
    startTransition(async () => {
      try {
        await createPrd(data);
        toast.success("PRD created");
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
          <DialogTitle>Create PRD</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="PRD title"
              className="mt-1"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {roadmapItems.length > 0 && (
            <div>
              <Label>Linked Roadmap Item</Label>
              <Select
                value={form.watch("roadmapItemId") ?? ""}
                onValueChange={(v) => form.setValue("roadmapItemId", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {roadmapItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create PRD"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
