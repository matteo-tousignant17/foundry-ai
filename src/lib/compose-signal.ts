import {
  MessageSquare,
  BarChart3,
  MessageCircle,
  Swords,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Signal types ───────────────────────────────────────

export type SignalType =
  | "conversation"
  | "data"
  | "feedback"
  | "competitive"
  | "internal";

export interface SignalTypeConfig {
  type: SignalType;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultSource: string;
  showSource: boolean;
  showCustomer: boolean;
  showArr: boolean;
  customerLabel?: string;
}

export const SIGNAL_TYPES: SignalTypeConfig[] = [
  {
    type: "conversation",
    label: "Conversation",
    icon: MessageSquare,
    description: "Calls, chats, interviews, tickets",
    defaultSource: "",
    showSource: true,
    showCustomer: true,
    showArr: true,
  },
  {
    type: "data",
    label: "Data",
    icon: BarChart3,
    description: "Metric anomalies, dropoffs",
    defaultSource: "other",
    showSource: false,
    showCustomer: false,
    showArr: false,
  },
  {
    type: "feedback",
    label: "Feedback",
    icon: MessageCircle,
    description: "NPS, surveys, feature requests",
    defaultSource: "other",
    showSource: false,
    showCustomer: true,
    showArr: true,
  },
  {
    type: "competitive",
    label: "Competitive",
    icon: Swords,
    description: "Market moves, win/loss",
    defaultSource: "other",
    showSource: false,
    showCustomer: true,
    showArr: true,
    customerLabel: "Affected Account",
  },
  {
    type: "internal",
    label: "Internal",
    icon: Eye,
    description: "Team observations, research",
    defaultSource: "other",
    showSource: false,
    showCustomer: false,
    showArr: false,
  },
];

// ─── Structured field types ─────────────────────────────

export interface ConversationFields {
  context: string;
  quotes: { speaker: string; quote: string }[];
  summary: string;
}

export interface DataFields {
  metric: string;
  currentValue: string;
  expected: string;
  context: string;
}

export interface FeedbackFields {
  verbatim: string;
  feedbackType: string;
  score: string;
  context: string;
}

export interface CompetitiveFields {
  competitor: string;
  event: string;
  details: string;
  sourceInfo: string;
}

export interface InternalFields {
  observation: string;
  origin: string;
  whoReported: string;
}

// ─── Compose functions ──────────────────────────────────

function composeConversation(f: ConversationFields): string {
  const parts: string[] = [];

  if (f.context.trim()) {
    parts.push(`[Context: ${f.context.trim()}]`);
  }

  for (const q of f.quotes) {
    if (q.quote.trim()) {
      const speaker = q.speaker.trim() || "Unknown";
      parts.push(`"${q.quote.trim()}" — ${speaker}`);
    }
  }

  if (f.summary.trim()) {
    parts.push(`[Takeaway: ${f.summary.trim()}]`);
  }

  return parts.join("\n\n");
}

function composeData(f: DataFields): string {
  const parts: string[] = [];

  if (f.metric.trim()) {
    let line = `Metric: ${f.metric.trim()}`;
    if (f.currentValue.trim()) {
      line += `\nCurrent: ${f.currentValue.trim()}`;
      if (f.expected.trim()) {
        line += ` (expected: ${f.expected.trim()})`;
      }
    }
    parts.push(line);
  }

  if (f.context.trim()) {
    parts.push(f.context.trim());
  }

  return parts.join("\n\n");
}

function composeFeedback(f: FeedbackFields): string {
  const parts: string[] = [];

  const header: string[] = [];
  if (f.feedbackType) header.push(f.feedbackType);
  if (f.score.trim()) header.push(`Score: ${f.score.trim()}`);
  if (header.length > 0) {
    parts.push(`[Feedback: ${header.join(", ")}]`);
  }

  if (f.verbatim.trim()) {
    parts.push(`"${f.verbatim.trim()}"`);
  }

  if (f.context.trim()) {
    parts.push(`[Context: ${f.context.trim()}]`);
  }

  return parts.join("\n\n");
}

function composeCompetitive(f: CompetitiveFields): string {
  const parts: string[] = [];

  if (f.competitor.trim()) {
    let line = `Competitor: ${f.competitor.trim()}`;
    if (f.event) {
      line += `\nSignal type: ${f.event}`;
    }
    parts.push(line);
  }

  if (f.details.trim()) {
    parts.push(f.details.trim());
  }

  if (f.sourceInfo.trim()) {
    parts.push(`[Source: ${f.sourceInfo.trim()}]`);
  }

  return parts.join("\n\n");
}

function composeInternal(f: InternalFields): string {
  const parts: string[] = [];

  const meta: string[] = [];
  if (f.origin.trim()) meta.push(`[Origin: ${f.origin.trim()}]`);
  if (f.whoReported.trim()) meta.push(`[Reported by: ${f.whoReported.trim()}]`);
  if (meta.length > 0) parts.push(meta.join("\n"));

  if (f.observation.trim()) {
    parts.push(f.observation.trim());
  }

  return parts.join("\n\n");
}

// ─── Main compose dispatcher ────────────────────────────

export type StructuredFields =
  | { type: "conversation"; fields: ConversationFields }
  | { type: "data"; fields: DataFields }
  | { type: "feedback"; fields: FeedbackFields }
  | { type: "competitive"; fields: CompetitiveFields }
  | { type: "internal"; fields: InternalFields };

export function composeRawText(input: StructuredFields): string {
  switch (input.type) {
    case "conversation":
      return composeConversation(input.fields);
    case "data":
      return composeData(input.fields);
    case "feedback":
      return composeFeedback(input.fields);
    case "competitive":
      return composeCompetitive(input.fields);
    case "internal":
      return composeInternal(input.fields);
  }
}

// ─── Validation ─────────────────────────────────────────

export function validateStructuredFields(input: StructuredFields): string | null {
  switch (input.type) {
    case "conversation": {
      const hasQuote = input.fields.quotes.some((q) => q.quote.trim().length > 0);
      if (!hasQuote) return "Add at least one quote";
      return null;
    }
    case "data":
      if (!input.fields.metric.trim()) return "Metric name is required";
      return null;
    case "feedback":
      if (!input.fields.verbatim.trim()) return "Paste the feedback text";
      return null;
    case "competitive":
      if (!input.fields.competitor.trim()) return "Competitor name is required";
      if (!input.fields.details.trim()) return "Details are required";
      return null;
    case "internal":
      if (!input.fields.observation.trim()) return "Observation is required";
      return null;
  }
}
