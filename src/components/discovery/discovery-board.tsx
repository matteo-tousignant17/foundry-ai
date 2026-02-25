"use client";

import { useState } from "react";
import {
  Radio,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DiscoverySignals } from "./discovery-signals";
import { DiscoveryProblems } from "./discovery-problems";

// ─── Types ──────────────────────────────────────────────

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

interface DiscoveryBoardProps {
  signals: Signal[];
  problems: Problem[];
}

// ─── Phase definitions ──────────────────────────────────

const PHASES = [
  {
    id: "signals" as const,
    number: 1,
    title: "Signals",
    subtitle: "What triggered this?",
    icon: Radio,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    activeBorder: "border-blue-500",
    description:
      "Raw inputs indicating something may be wrong or missing. These are observations, not conclusions.",
    examples: [
      "Data anomalies (dropoff, low adoption, slow task completion)",
      "Customer feedback or support trends",
      "Sales requests",
      "Competitive moves",
      "Internal friction",
      "UX research findings",
    ],
    purpose: "Capture why this entered discovery without jumping to solutions.",
  },
  {
    id: "problems" as const,
    number: 2,
    title: "Problems",
    subtitle: "What is actually happening?",
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    activeBorder: "border-amber-500",
    description:
      "Translate signals into a clear, validated problem statement.",
    includes: [
      "Who is experiencing the issue",
      "What they cannot do or struggle with",
      "Where in the journey/workflow it occurs",
      "Impact on user and business",
      "Evidence supporting it",
    ],
    purpose: "Align everyone on the real problem before ideation.",
  },
] as const;

// ─── Component ──────────────────────────────────────────

export function DiscoveryBoard({ signals, problems }: DiscoveryBoardProps) {
  const [activePhase, setActivePhase] = useState<"signals" | "problems">(
    "signals"
  );
  const [guidesExpanded, setGuidesExpanded] = useState<Record<string, boolean>>(
    {}
  );

  const newSignals = signals.filter((s) => s.status === "new").length;
  const processedSignals = signals.filter(
    (s) => s.status === "processed"
  ).length;
  const draftProblems = problems.filter((p) => p.status === "draft").length;
  const shapedProblems = problems.filter((p) => p.status === "shaped").length;
  const acceptedProblems = problems.filter(
    (p) => p.status === "accepted"
  ).length;

  function toggleGuide(id: string) {
    setGuidesExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      {/* Phase selector */}
      <div className="flex items-center gap-2">
        {PHASES.map((phase, i) => (
          <div key={phase.id} className="flex items-center gap-2">
            <button
              onClick={() => setActivePhase(phase.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                activePhase === phase.id
                  ? `${phase.activeBorder} ${phase.bgColor} shadow-sm`
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  activePhase === phase.id
                    ? `${phase.bgColor} ${phase.color}`
                    : "bg-muted text-muted-foreground"
                )}
              >
                {phase.number}
              </div>
              <div>
                <p className="text-sm font-semibold">{phase.title}</p>
                <p className="text-xs text-muted-foreground">
                  {phase.subtitle}
                </p>
              </div>
              {phase.id === "signals" && newSignals > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {newSignals} new
                </Badge>
              )}
              {phase.id === "problems" && draftProblems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {draftProblems} draft
                </Badge>
              )}
            </button>
            {i < PHASES.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Phase guide card */}
      {PHASES.filter((p) => p.id === activePhase).map((phase) => {
        const expanded = guidesExpanded[phase.id] ?? false;
        return (
          <div
            key={phase.id}
            className={cn(
              "rounded-lg border",
              phase.borderColor,
              phase.bgColor
            )}
          >
            <button
              onClick={() => toggleGuide(phase.id)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <phase.icon className={cn("h-4 w-4", phase.color)} />
                <div className="text-left">
                  <p className="text-sm font-medium">{phase.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {phase.purpose}
                  </p>
                </div>
              </div>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {expanded && (
              <div className="border-t px-4 py-3 space-y-2">
                {"examples" in phase && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Examples
                    </p>
                    <ul className="space-y-1">
                      {phase.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {"includes" in phase && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Include
                    </p>
                    <ul className="space-y-1">
                      {phase.includes.map((inc, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        {activePhase === "signals" ? (
          <>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">
                {newSignals} new
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                {processedSignals} processed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">
                {signals.length} total
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-muted-foreground">
                {draftProblems} draft
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">
                {shapedProblems} shaped
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                {acceptedProblems} accepted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">
                {problems.length} total
              </span>
            </div>
          </>
        )}
      </div>

      {/* Phase content */}
      {activePhase === "signals" ? (
        <DiscoverySignals signals={signals} />
      ) : (
        <DiscoveryProblems problems={problems} />
      )}
    </div>
  );
}
