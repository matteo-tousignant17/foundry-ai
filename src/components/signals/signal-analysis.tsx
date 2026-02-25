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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Quote,
  Check,
  X,
  CheckCheck,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { analyzeSignal, acceptSuggestedProblem, acceptAllSuggestedProblems } from "@/lib/actions/ai-signals";
import { toast } from "sonner";
import type { ExtractionResult } from "@/lib/ai/extract";

interface SignalAnalysisProps {
  signalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyzeButton({
  onAnalysis,
}: {
  signalId: string;
  onAnalysis: () => void;
}) {
  return (
    <Button size="sm" variant="outline" onClick={onAnalysis}>
      <Sparkles className="mr-2 h-3 w-3" />
      Analyze
    </Button>
  );
}

export function SignalAnalysis({ signalId, open, onOpenChange }: SignalAnalysisProps) {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedIndexes, setAcceptedIndexes] = useState<Set<number>>(new Set());
  const [rejectedIndexes, setRejectedIndexes] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();

  async function runAnalysis() {
    setLoading(true);
    setAcceptedIndexes(new Set());
    setRejectedIndexes(new Set());
    try {
      const res = await analyzeSignal(signalId);
      setResult(res);
    } catch {
      toast.error("Analysis failed. Check your API key in .env.local");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept(index: number) {
    if (!result) return;
    const suggestion = result.suggestedProblems[index];
    const firstQuote = result.quotes[0]?.text;

    startTransition(async () => {
      try {
        await acceptSuggestedProblem(signalId, suggestion, firstQuote);
        setAcceptedIndexes((prev) => new Set(prev).add(index));
        toast.success(`Problem "${suggestion.title}" created`);
      } catch {
        toast.error("Failed to create problem");
      }
    });
  }

  function handleReject(index: number) {
    setRejectedIndexes((prev) => new Set(prev).add(index));
  }

  function handleAcceptAll() {
    if (!result) return;
    const unhandled = result.suggestedProblems.filter(
      (_, i) => !acceptedIndexes.has(i) && !rejectedIndexes.has(i)
    );
    if (unhandled.length === 0) return;

    startTransition(async () => {
      try {
        await acceptAllSuggestedProblems(
          signalId,
          unhandled,
          result.quotes.map((q) => q.text)
        );
        const newAccepted = new Set(acceptedIndexes);
        result.suggestedProblems.forEach((_, i) => {
          if (!rejectedIndexes.has(i)) newAccepted.add(i);
        });
        setAcceptedIndexes(newAccepted);
        toast.success(`${unhandled.length} problems created`);
      } catch {
        toast.error("Failed to create problems");
      }
    });
  }

  // Run analysis when sheet opens and no result yet
  if (open && !result && !loading) {
    runAnalysis();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Signal Analysis
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Analyzing signal...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 mt-6">
            {/* Sentiment */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sentiment:</span>
              <Badge
                variant="outline"
                className={
                  result.customerSentiment === "frustrated"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : result.customerSentiment === "positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : ""
                }
              >
                {result.customerSentiment}
              </Badge>
            </div>

            {/* Extracted Quotes */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Extracted Quotes ({result.quotes.length})
              </h3>
              <div className="space-y-2">
                {result.quotes.map((q, i) => (
                  <div
                    key={i}
                    className="rounded border-l-2 border-l-primary/50 bg-muted/50 p-3"
                  >
                    <p className="text-sm italic">&ldquo;{q.text}&rdquo;</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      <span className="text-muted-foreground mr-1">Inferred:</span>
                      {q.theme}
                    </Badge>
                  </div>
                ))}
                {result.quotes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No clear quotes found.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Suggested Problems */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Suggested Problems ({result.suggestedProblems.length})
                </h3>
                {result.suggestedProblems.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAcceptAll}
                    disabled={pending}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Accept All
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {result.suggestedProblems.map((problem, i) => {
                  const accepted = acceptedIndexes.has(i);
                  const rejected = rejectedIndexes.has(i);
                  return (
                    <Card
                      key={i}
                      className={
                        accepted
                          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                          : rejected
                            ? "opacity-50"
                            : ""
                      }
                    >
                      <CardHeader className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{problem.title}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {problem.severity}
                            </Badge>
                          </div>
                          {!accepted && !rejected && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleAccept(i)}
                                disabled={pending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(i)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {accepted && (
                            <Badge className="bg-green-600 text-white">
                              Accepted
                            </Badge>
                          )}
                          {rejected && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <p className="text-sm text-muted-foreground">
                          {problem.statement}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Missing Metadata */}
            {result.missingMetadata.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Missing Context
                  </h3>
                  <div className="space-y-2">
                    {result.missingMetadata.map((m, i) => (
                      <div
                        key={i}
                        className="rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3"
                      >
                        <p className="text-sm">
                          <span className="font-medium">{m.field}:</span>{" "}
                          {m.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <Button
              variant="outline"
              className="w-full"
              onClick={runAnalysis}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Re-analyze
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
