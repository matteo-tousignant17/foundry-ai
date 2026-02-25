"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signalInsertSchema, type SignalInsert } from "@/lib/validators/signal";
import { createSignal, updateSignal } from "@/lib/actions/signals";
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
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  SIGNAL_TYPES,
  composeRawText,
  validateStructuredFields,
  type SignalType,
  type ConversationFields,
  type DataFields,
  type FeedbackFields,
  type CompetitiveFields,
  type InternalFields,
  type StructuredFields,
} from "@/lib/compose-signal";
import { SignalTypeFields } from "./signal-type-fields";

interface SignalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any> & { id?: string };
}

const SOURCES = [
  { value: "gong", label: "Gong" },
  { value: "zendesk", label: "Zendesk" },
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "other", label: "Other" },
];

const SEVERITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "rare", label: "Rare" },
];

// ─── Default structured field states ────────────────────

const DEFAULT_CONVERSATION: ConversationFields = {
  context: "",
  quotes: [{ speaker: "", quote: "" }],
  summary: "",
};

const DEFAULT_DATA: DataFields = {
  metric: "",
  currentValue: "",
  expected: "",
  context: "",
};

const DEFAULT_FEEDBACK: FeedbackFields = {
  verbatim: "",
  feedbackType: "",
  score: "",
  context: "",
};

const DEFAULT_COMPETITIVE: CompetitiveFields = {
  competitor: "",
  event: "",
  details: "",
  sourceInfo: "",
};

const DEFAULT_INTERNAL: InternalFields = {
  observation: "",
  origin: "",
  whoReported: "",
};

// ─── Component ──────────────────────────────────────────

export function SignalForm({ open, onOpenChange, defaultValues }: SignalFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!defaultValues?.id;

  // Signal type (create mode only)
  const [signalType, setSignalType] = useState<SignalType>("conversation");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Structured field states
  const [conversationFields, setConversationFields] =
    useState<ConversationFields>(DEFAULT_CONVERSATION);
  const [dataFields, setDataFields] = useState<DataFields>(DEFAULT_DATA);
  const [feedbackFields, setFeedbackFields] =
    useState<FeedbackFields>(DEFAULT_FEEDBACK);
  const [competitiveFields, setCompetitiveFields] =
    useState<CompetitiveFields>(DEFAULT_COMPETITIVE);
  const [internalFields, setInternalFields] =
    useState<InternalFields>(DEFAULT_INTERNAL);

  // Metadata form (used for both create and edit)
  const form = useForm<SignalInsert>({
    resolver: isEditing ? zodResolver(signalInsertSchema) : undefined,
    defaultValues: {
      rawText: defaultValues?.rawText ?? "",
      source: defaultValues?.source,
      sourceUrl: defaultValues?.sourceUrl ?? "",
      customer: defaultValues?.customer ?? "",
      arr: defaultValues?.arr ?? "",
      severity: defaultValues?.severity,
      frequency: defaultValues?.frequency,
      renewalRisk: defaultValues?.renewalRisk,
    },
  });

  // Get current type config
  const typeConfig = SIGNAL_TYPES.find((t) => t.type === signalType)!;

  function getStructuredInput(): StructuredFields {
    switch (signalType) {
      case "conversation":
        return { type: "conversation", fields: conversationFields };
      case "data":
        return { type: "data", fields: dataFields };
      case "feedback":
        return { type: "feedback", fields: feedbackFields };
      case "competitive":
        return { type: "competitive", fields: competitiveFields };
      case "internal":
        return { type: "internal", fields: internalFields };
    }
  }

  function resetStructuredFields() {
    setConversationFields(DEFAULT_CONVERSATION);
    setDataFields(DEFAULT_DATA);
    setFeedbackFields(DEFAULT_FEEDBACK);
    setCompetitiveFields(DEFAULT_COMPETITIVE);
    setInternalFields(DEFAULT_INTERNAL);
    setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEditing) {
      // Edit mode: use react-hook-form validation
      form.handleSubmit(onSubmitEdit)(e);
      return;
    }

    // Create mode: validate structured fields, compose rawText
    const input = getStructuredInput();
    const error = validateStructuredFields(input);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    const rawText = composeRawText(input);
    const metadata = form.getValues();

    // Set default source for non-conversation types
    const source = typeConfig.showSource
      ? metadata.source
      : (typeConfig.defaultSource as SignalInsert["source"]);

    const data: SignalInsert = {
      rawText,
      source,
      sourceUrl: metadata.sourceUrl,
      customer: typeConfig.showCustomer ? metadata.customer : undefined,
      arr: typeConfig.showArr ? metadata.arr : undefined,
      severity: metadata.severity,
      frequency: metadata.frequency,
    };

    startTransition(async () => {
      try {
        await createSignal(data);
        toast.success("Signal created");
        form.reset();
        resetStructuredFields();
        onOpenChange(false);
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function onSubmitEdit(data: SignalInsert) {
    startTransition(async () => {
      try {
        await updateSignal(defaultValues!.id!, data);
        toast.success("Signal updated");
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
          <DialogTitle>{isEditing ? "Edit Signal" : "Add Signal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Signal type selector (create mode only) */}
          {!isEditing && (
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {SIGNAL_TYPES.map((st) => {
                const Icon = st.icon;
                const active = signalType === st.type;
                return (
                  <button
                    key={st.type}
                    type="button"
                    onClick={() => {
                      setSignalType(st.type);
                      setValidationError(null);
                    }}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-center transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium leading-tight">
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Structured fields (create) or rawText textarea (edit) */}
          {isEditing ? (
            <div>
              <Label htmlFor="rawText">VoC Text *</Label>
              <Textarea
                id="rawText"
                placeholder="Paste Gong snippet, support ticket, email, or customer feedback..."
                className="mt-1 min-h-[120px]"
                {...form.register("rawText")}
              />
              {form.formState.errors.rawText && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.rawText.message}
                </p>
              )}
            </div>
          ) : (
            <>
              <SignalTypeFields
                signalType={signalType}
                conversationFields={conversationFields}
                onConversationChange={setConversationFields}
                dataFields={dataFields}
                onDataChange={setDataFields}
                feedbackFields={feedbackFields}
                onFeedbackChange={setFeedbackFields}
                competitiveFields={competitiveFields}
                onCompetitiveChange={setCompetitiveFields}
                internalFields={internalFields}
                onInternalChange={setInternalFields}
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </>
          )}

          {/* Metadata — conditionally shown per type */}
          <div className="space-y-4">
            {/* Source + Customer row */}
            {(isEditing || typeConfig.showSource || typeConfig.showCustomer) && (
              <div
                className={cn(
                  "grid gap-4",
                  (isEditing || typeConfig.showSource) && (isEditing || typeConfig.showCustomer)
                    ? "grid-cols-2"
                    : "grid-cols-1"
                )}
              >
                {(isEditing || typeConfig.showSource) && (
                  <div>
                    <Label>Source</Label>
                    <Select
                      value={form.watch("source") ?? ""}
                      onValueChange={(v) =>
                        form.setValue("source", v as SignalInsert["source"])
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(isEditing || typeConfig.showCustomer) && (
                  <div>
                    <Label htmlFor="customer">
                      {typeConfig.customerLabel ?? "Customer"}
                    </Label>
                    <Input
                      id="customer"
                      placeholder="Company or person"
                      className="mt-1"
                      {...form.register("customer")}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Source URL (edit mode only) */}
            {isEditing && (
              <div>
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://..."
                  className="mt-1"
                  {...form.register("sourceUrl")}
                />
              </div>
            )}

            {/* Severity, Frequency, ARR row */}
            <div
              className={cn(
                "grid gap-4",
                isEditing || typeConfig.showArr ? "grid-cols-3" : "grid-cols-2"
              )}
            >
              <div>
                <Label>Severity</Label>
                <Select
                  value={form.watch("severity") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("severity", v as SignalInsert["severity"])
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.watch("frequency") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("frequency", v as SignalInsert["frequency"])
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(isEditing || typeConfig.showArr) && (
                <div>
                  <Label htmlFor="arr">ARR</Label>
                  <Input
                    id="arr"
                    placeholder="$50K"
                    className="mt-1"
                    {...form.register("arr")}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Add Signal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
