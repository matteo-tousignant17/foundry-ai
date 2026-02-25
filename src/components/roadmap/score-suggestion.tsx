"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Check, Loader2, AlertTriangle } from "lucide-react";
import { suggestItemScore, applyScoreSuggestion } from "@/lib/actions/ai-roadmap";
import { toast } from "sonner";
import type { ScoreSuggestion } from "@/lib/ai/score";

interface ScoreSuggestionSheetProps {
  itemId: string;
  itemTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ScoreRow({
  label,
  value,
  reasoning,
}: {
  label: string;
  value: number;
  reasoning: string;
}) {
  const color =
    value >= 7
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : value >= 4
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="outline" className={`font-mono ${color}`}>
          {value}/10
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{reasoning}</p>
    </div>
  );
}

export function ScoreSuggestionSheet({
  itemId,
  itemTitle,
  open,
  onOpenChange,
}: ScoreSuggestionSheetProps) {
  const [result, setResult] = useState<ScoreSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function runScoring() {
    setLoading(true);
    try {
      const res = await suggestItemScore(itemId);
      setResult(res);
    } catch {
      toast.error("Scoring failed. Check your API key in .env.local");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    startTransition(async () => {
      try {
        await applyScoreSuggestion(itemId, {
          reach: result.reach.value,
          impact: result.impact.value,
          confidence: result.confidence.value,
          effort: result.effort.value,
        });
        toast.success("Scores applied");
        onOpenChange(false);
      } catch {
        toast.error("Failed to apply scores");
      }
    });
  }

  if (open && !result && !loading) {
    runScoring();
  }

  const computedScore =
    result
      ? Math.round(
          ((result.reach.value *
            result.impact.value *
            result.confidence.value) /
            result.effort.value) *
            10
        ) / 10
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Score Suggestion
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{itemTitle}</p>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Analyzing item...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5 mt-6">
            <div className="space-y-4">
              <ScoreRow
                label="Reach"
                value={result.reach.value}
                reasoning={result.reach.reasoning}
              />
              <ScoreRow
                label="Impact"
                value={result.impact.value}
                reasoning={result.impact.reasoning}
              />
              <ScoreRow
                label="Confidence"
                value={result.confidence.value}
                reasoning={result.confidence.reasoning}
              />
              <ScoreRow
                label="Effort"
                value={result.effort.value}
                reasoning={result.effort.reasoning}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Computed Score</span>
              <span className="text-lg font-mono font-bold">
                {computedScore}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {result.overallRationale}
            </p>

            {result.assumptions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" />
                  Assumptions
                </h4>
                <ul className="space-y-1">
                  {result.assumptions.map((a, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex items-start gap-1"
                    >
                      <span className="text-yellow-500 mt-0.5">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleApply} disabled={pending} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                {pending ? "Applying..." : "Apply Scores"}
              </Button>
              <Button
                variant="outline"
                onClick={runScoring}
                disabled={loading}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Re-score
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
