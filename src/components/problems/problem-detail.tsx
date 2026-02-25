"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Quote, Link as LinkIcon } from "lucide-react";
import { linkSignalToProblem, unlinkSignalFromProblem } from "@/lib/actions/problems";
import { toast } from "sonner";

interface Signal {
  id: string;
  rawText: string;
  source: string | null;
  customer: string | null;
}

interface SignalLink {
  id: string;
  signalId: string;
  problemId: string;
  quote: string | null;
  signal: Signal;
}

interface Problem {
  id: string;
  title: string;
  statement: string;
  whoAffected: string | null;
  workflowBlock: string | null;
  businessImpact: string | null;
  retentionOrGrowth: string | null;
  status: string;
  severity: string | null;
  frequency: string | null;
  signalProblems: SignalLink[];
}

interface ProblemDetailProps {
  problem: Problem;
  allSignals: Signal[];
}

export function ProblemDetail({ problem, allSignals }: ProblemDetailProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [quote, setQuote] = useState("");
  const [pending, startTransition] = useTransition();

  const linkedSignalIds = new Set(problem.signalProblems.map((sp) => sp.signalId));
  const availableSignals = allSignals.filter((s) => !linkedSignalIds.has(s.id));

  function handleLink() {
    if (!selectedSignalId) return;
    startTransition(async () => {
      await linkSignalToProblem(problem.id, selectedSignalId, quote || undefined);
      toast.success("Signal linked");
      setLinkOpen(false);
      setSelectedSignalId("");
      setQuote("");
    });
  }

  function handleUnlink(linkId: string) {
    startTransition(async () => {
      await unlinkSignalFromProblem(linkId, problem.id);
      toast.success("Signal unlinked");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">{problem.status}</Badge>
          {problem.severity && <Badge variant="outline">{problem.severity}</Badge>}
          {problem.frequency && <Badge variant="outline">{problem.frequency}</Badge>}
          {problem.retentionOrGrowth && (
            <Badge variant="outline">{problem.retentionOrGrowth}</Badge>
          )}
        </div>
        <p className="text-base">{problem.statement}</p>
      </div>

      {(problem.whoAffected || problem.workflowBlock || problem.businessImpact) && (
        <div className="grid gap-4 sm:grid-cols-3">
          {problem.whoAffected && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Who Affected</p>
              <p className="text-sm">{problem.whoAffected}</p>
            </div>
          )}
          {problem.workflowBlock && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Workflow Block</p>
              <p className="text-sm">{problem.workflowBlock}</p>
            </div>
          )}
          {problem.businessImpact && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Business Impact</p>
              <p className="text-sm">{problem.businessImpact}</p>
            </div>
          )}
        </div>
      )}

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Evidence ({problem.signalProblems.length} signal{problem.signalProblems.length !== 1 ? "s" : ""})
          </h2>
          <Button size="sm" onClick={() => setLinkOpen(true)} disabled={availableSignals.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Link Signal
          </Button>
        </div>

        {problem.signalProblems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No signals linked yet. Link signals to add evidence.
          </p>
        ) : (
          <div className="space-y-3">
            {problem.signalProblems.map((sp) => (
              <Card key={sp.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 py-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {sp.signal.source && `[${sp.signal.source}]`}{" "}
                      {sp.signal.customer || "Unknown"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUnlink(sp.id)}
                    disabled={pending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  {sp.quote && (
                    <div className="mb-2 flex items-start gap-2 rounded bg-muted/50 p-2">
                      <Quote className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-sm italic">{sp.quote}</p>
                    </div>
                  )}
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {sp.signal.rawText}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Signal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Signal</Label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedSignalId}
                onChange={(e) => setSelectedSignalId(e.target.value)}
              >
                <option value="">Choose a signal...</option>
                {availableSignals.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.customer || "Unknown"} — {s.rawText.slice(0, 80)}...
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quote">Supporting Quote (optional)</Label>
              <Textarea
                id="quote"
                placeholder="Paste a verbatim quote from the signal..."
                className="mt-1"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLinkOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLink} disabled={!selectedSignalId || pending}>
                {pending ? "Linking..." : "Link Signal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
