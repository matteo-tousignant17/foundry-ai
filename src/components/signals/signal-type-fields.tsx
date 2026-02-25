"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type {
  SignalType,
  ConversationFields,
  DataFields,
  FeedbackFields,
  CompetitiveFields,
  InternalFields,
} from "@/lib/compose-signal";

// ─── Conversation ───────────────────────────────────────

export function ConversationFieldset({
  fields,
  onChange,
}: {
  fields: ConversationFields;
  onChange: (f: ConversationFields) => void;
}) {
  function updateQuote(
    index: number,
    key: "speaker" | "quote",
    value: string
  ) {
    const next = [...fields.quotes];
    next[index] = { ...next[index], [key]: value };
    onChange({ ...fields, quotes: next });
  }

  function addQuote() {
    onChange({
      ...fields,
      quotes: [...fields.quotes, { speaker: "", quote: "" }],
    });
  }

  function removeQuote(index: number) {
    if (fields.quotes.length <= 1) return;
    onChange({
      ...fields,
      quotes: fields.quotes.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Context</Label>
        <Textarea
          placeholder="What was the situation? e.g., QBR call, escalation, onboarding check-in"
          className="mt-1 min-h-[56px]"
          value={fields.context}
          onChange={(e) => onChange({ ...fields, context: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Quotes *</Label>
        {fields.quotes.map((q, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Input
                placeholder="Speaker — e.g., VP Ops, CSM"
                value={q.speaker}
                onChange={(e) => updateQuote(i, "speaker", e.target.value)}
              />
              <Textarea
                placeholder="What they said (verbatim or paraphrased)"
                className="min-h-[72px]"
                value={q.quote}
                onChange={(e) => updateQuote(i, "quote", e.target.value)}
              />
            </div>
            {fields.quotes.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-0.5 text-muted-foreground hover:text-destructive"
                onClick={() => removeQuote(i)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuote}
          className="w-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Quote
        </Button>
      </div>

      <div>
        <Label>Takeaway</Label>
        <Textarea
          placeholder="Your one-sentence summary"
          className="mt-1 min-h-[56px]"
          value={fields.summary}
          onChange={(e) => onChange({ ...fields, summary: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Data ───────────────────────────────────────────────

export function DataFieldset({
  fields,
  onChange,
}: {
  fields: DataFields;
  onChange: (f: DataFields) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Metric *</Label>
        <Input
          placeholder="e.g., Onboarding completion rate, P95 latency, DAU"
          className="mt-1"
          value={fields.metric}
          onChange={(e) => onChange({ ...fields, metric: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Current Value</Label>
          <Input
            placeholder="e.g., 34%, 2.1s"
            className="mt-1"
            value={fields.currentValue}
            onChange={(e) =>
              onChange({ ...fields, currentValue: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Expected / Baseline</Label>
          <Input
            placeholder="e.g., 60%, 500ms"
            className="mt-1"
            value={fields.expected}
            onChange={(e) => onChange({ ...fields, expected: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Context</Label>
        <Textarea
          placeholder="Where did you observe this? What changed? Any hypothesis?"
          className="mt-1 min-h-[72px]"
          value={fields.context}
          onChange={(e) => onChange({ ...fields, context: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Feedback ───────────────────────────────────────────

const FEEDBACK_TYPES = [
  { value: "NPS Response", label: "NPS" },
  { value: "Survey Response", label: "Survey" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Review", label: "Review" },
];

export function FeedbackFieldset({
  fields,
  onChange,
}: {
  fields: FeedbackFields;
  onChange: (f: FeedbackFields) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Verbatim *</Label>
        <Textarea
          placeholder="Paste the customer's response..."
          className="mt-1 min-h-[96px]"
          value={fields.verbatim}
          onChange={(e) => onChange({ ...fields, verbatim: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Feedback Type</Label>
          <Select
            value={fields.feedbackType}
            onValueChange={(v) => onChange({ ...fields, feedbackType: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Score</Label>
          <Input
            placeholder="e.g., NPS 3, CSAT 2/5"
            className="mt-1"
            value={fields.score}
            onChange={(e) => onChange({ ...fields, score: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Context</Label>
        <Textarea
          placeholder="Survey name, question asked, campaign..."
          className="mt-1 min-h-[56px]"
          value={fields.context}
          onChange={(e) => onChange({ ...fields, context: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Competitive ────────────────────────────────────────

const COMPETITIVE_EVENTS = [
  { value: "Product launch", label: "Product Launch" },
  { value: "Pricing change", label: "Pricing Change" },
  { value: "Deal lost", label: "Deal Lost" },
  { value: "Deal won", label: "Deal Won" },
  { value: "Other", label: "Other" },
];

export function CompetitiveFieldset({
  fields,
  onChange,
}: {
  fields: CompetitiveFields;
  onChange: (f: CompetitiveFields) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Competitor *</Label>
          <Input
            placeholder="Competitor name"
            className="mt-1"
            value={fields.competitor}
            onChange={(e) =>
              onChange({ ...fields, competitor: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Event</Label>
          <Select
            value={fields.event}
            onValueChange={(v) => onChange({ ...fields, event: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {COMPETITIVE_EVENTS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Details *</Label>
        <Textarea
          placeholder="What happened? What did you observe?"
          className="mt-1 min-h-[96px]"
          value={fields.details}
          onChange={(e) => onChange({ ...fields, details: e.target.value })}
        />
      </div>

      <div>
        <Label>Source Info</Label>
        <Input
          placeholder="Where did you learn this? e.g., G2, sales debrief"
          className="mt-1"
          value={fields.sourceInfo}
          onChange={(e) => onChange({ ...fields, sourceInfo: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Internal ───────────────────────────────────────────

export function InternalFieldset({
  fields,
  onChange,
}: {
  fields: InternalFields;
  onChange: (f: InternalFields) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Observation *</Label>
        <Textarea
          placeholder="What did you notice? What's the friction or finding?"
          className="mt-1 min-h-[96px]"
          value={fields.observation}
          onChange={(e) => onChange({ ...fields, observation: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Origin</Label>
          <Input
            placeholder="e.g., Eng retro, UX research session"
            className="mt-1"
            value={fields.origin}
            onChange={(e) => onChange({ ...fields, origin: e.target.value })}
          />
        </div>
        <div>
          <Label>Who Reported</Label>
          <Input
            placeholder="Team or person"
            className="mt-1"
            value={fields.whoReported}
            onChange={(e) =>
              onChange({ ...fields, whoReported: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

// ─── Dispatcher ─────────────────────────────────────────

export function SignalTypeFields({
  signalType,
  conversationFields,
  onConversationChange,
  dataFields,
  onDataChange,
  feedbackFields,
  onFeedbackChange,
  competitiveFields,
  onCompetitiveChange,
  internalFields,
  onInternalChange,
}: {
  signalType: SignalType;
  conversationFields: ConversationFields;
  onConversationChange: (f: ConversationFields) => void;
  dataFields: DataFields;
  onDataChange: (f: DataFields) => void;
  feedbackFields: FeedbackFields;
  onFeedbackChange: (f: FeedbackFields) => void;
  competitiveFields: CompetitiveFields;
  onCompetitiveChange: (f: CompetitiveFields) => void;
  internalFields: InternalFields;
  onInternalChange: (f: InternalFields) => void;
}) {
  switch (signalType) {
    case "conversation":
      return (
        <ConversationFieldset
          fields={conversationFields}
          onChange={onConversationChange}
        />
      );
    case "data":
      return <DataFieldset fields={dataFields} onChange={onDataChange} />;
    case "feedback":
      return (
        <FeedbackFieldset
          fields={feedbackFields}
          onChange={onFeedbackChange}
        />
      );
    case "competitive":
      return (
        <CompetitiveFieldset
          fields={competitiveFields}
          onChange={onCompetitiveChange}
        />
      );
    case "internal":
      return (
        <InternalFieldset
          fields={internalFields}
          onChange={onInternalChange}
        />
      );
  }
}
