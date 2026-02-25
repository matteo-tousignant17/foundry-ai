"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { updatePrdSection, updatePrd } from "@/lib/actions/prds";
import { toast } from "sonner";

interface Prd {
  id: string;
  title: string;
  status: string;
  summary: string | null;
  problemStatement: string | null;
  objectives: string | null;
  userStories: string | null;
  designAssetLink: string | null;
  openQuestions: string | null;
  acceptanceCriteria: string | null;
  evidence: string | null;
}

interface PrdEditorProps {
  prd: Prd;
}

interface UserStory {
  role: string;
  action: string;
  benefit: string;
}

interface OpenQuestion {
  question: string;
  answer?: string;
  acceptedAsRisk?: boolean;
}

function parseJson<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function SectionEditor({
  prdId,
  section,
  label,
  initialValue,
  placeholder,
}: {
  prdId: string;
  section: string;
  label: string;
  initialValue: string;
  placeholder: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  function save() {
    startTransition(async () => {
      await updatePrdSection(prdId, section, value);
      toast.success(`${label} saved`);
      setDirty(false);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {dirty && (
          <Button size="sm" variant="outline" onClick={save} disabled={pending}>
            <Save className="mr-1 h-3 w-3" />
            {pending ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        placeholder={placeholder}
        className="min-h-[120px]"
      />
    </div>
  );
}

function UserStoriesEditor({ prdId, initialStories }: { prdId: string; initialStories: UserStory[] }) {
  const [stories, setStories] = useState<UserStory[]>(initialStories);
  const [pending, startTransition] = useTransition();

  function addStory() {
    setStories([...stories, { role: "", action: "", benefit: "" }]);
  }

  function removeStory(index: number) {
    setStories(stories.filter((_, i) => i !== index));
  }

  function updateStory(index: number, field: keyof UserStory, value: string) {
    const updated = [...stories];
    updated[index] = { ...updated[index], [field]: value };
    setStories(updated);
  }

  function save() {
    startTransition(async () => {
      await updatePrdSection(prdId, "userStories", JSON.stringify(stories));
      toast.success("User stories saved");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>User Stories</Label>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addStory}>
            <Plus className="mr-1 h-3 w-3" />
            Add Story
          </Button>
          <Button size="sm" variant="outline" onClick={save} disabled={pending}>
            <Save className="mr-1 h-3 w-3" />
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      {stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No user stories yet.</p>
      ) : (
        stories.map((story, i) => (
          <div key={i} className="flex items-start gap-2 rounded border p-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">As a</span>
                <Input
                  value={story.role}
                  onChange={(e) => updateStory(i, "role", e.target.value)}
                  placeholder="role"
                  className="h-7 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">I want to</span>
                <Input
                  value={story.action}
                  onChange={(e) => updateStory(i, "action", e.target.value)}
                  placeholder="action"
                  className="h-7 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">So that</span>
                <Input
                  value={story.benefit}
                  onChange={(e) => updateStory(i, "benefit", e.target.value)}
                  placeholder="benefit"
                  className="h-7 text-sm"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeStory(i)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

function OpenQuestionsEditor({
  prdId,
  initialQuestions,
}: {
  prdId: string;
  initialQuestions: OpenQuestion[];
}) {
  const [questions, setQuestions] = useState<OpenQuestion[]>(initialQuestions);
  const [pending, startTransition] = useTransition();

  function addQuestion() {
    setQuestions([...questions, { question: "" }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof OpenQuestion, value: string | boolean) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function save() {
    startTransition(async () => {
      await updatePrdSection(prdId, "openQuestions", JSON.stringify(questions));
      toast.success("Open questions saved");
    });
  }

  const allResolved = questions.length > 0 && questions.every(
    (q) => q.answer || q.acceptedAsRisk
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Open Questions</Label>
          {questions.length > 0 && (
            <Badge variant={allResolved ? "default" : "outline"}>
              {questions.filter((q) => q.answer || q.acceptedAsRisk).length}/{questions.length} resolved
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus className="mr-1 h-3 w-3" />
            Add Question
          </Button>
          <Button size="sm" variant="outline" onClick={save} disabled={pending}>
            <Save className="mr-1 h-3 w-3" />
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open questions.</p>
      ) : (
        questions.map((q, i) => (
          <div key={i} className="rounded border p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  value={q.question}
                  onChange={(e) => updateQuestion(i, "question", e.target.value)}
                  placeholder="Question..."
                  className="text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeQuestion(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              value={q.answer ?? ""}
              onChange={(e) => updateQuestion(i, "answer", e.target.value)}
              placeholder="Answer..."
              className="min-h-[60px] text-sm"
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={q.acceptedAsRisk ?? false}
                onChange={(e) => updateQuestion(i, "acceptedAsRisk", e.target.checked)}
              />
              Accept as known risk
            </label>
          </div>
        ))
      )}
    </div>
  );
}

export function PrdEditor({ prd }: PrdEditorProps) {
  const [, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updatePrd(prd.id, { status });
      toast.success(`Status changed to ${status}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={prd.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="problem">Problem</TabsTrigger>
          <TabsTrigger value="stories">User Stories</TabsTrigger>
          <TabsTrigger value="criteria">Acceptance Criteria</TabsTrigger>
          <TabsTrigger value="questions">Open Questions</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <SectionEditor
            prdId={prd.id}
            section="summary"
            label="Summary"
            initialValue={prd.summary ?? ""}
            placeholder="Brief overview of what this feature/initiative does and why..."
          />
          <SectionEditor
            prdId={prd.id}
            section="objectives"
            label="Objectives"
            initialValue={prd.objectives ?? ""}
            placeholder="What objectives does this serve? How does it align with the roadmap?"
          />
          <div>
            <Label>Design Asset Link</Label>
            <Input
              defaultValue={prd.designAssetLink ?? ""}
              placeholder="Figma, Whimsical, etc."
              className="mt-1"
              onBlur={(e) => {
                startTransition(async () => {
                  await updatePrdSection(prd.id, "designAssetLink", e.target.value);
                });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="problem" className="pt-4">
          <SectionEditor
            prdId={prd.id}
            section="problemStatement"
            label="Problem Statement"
            initialValue={prd.problemStatement ?? ""}
            placeholder="What problem does this solve? Who is affected? What's the business impact?"
          />
        </TabsContent>

        <TabsContent value="stories" className="pt-4">
          <UserStoriesEditor
            prdId={prd.id}
            initialStories={parseJson<UserStory[]>(prd.userStories, [])}
          />
        </TabsContent>

        <TabsContent value="criteria" className="pt-4">
          <SectionEditor
            prdId={prd.id}
            section="acceptanceCriteria"
            label="Acceptance Criteria"
            initialValue={prd.acceptanceCriteria ?? ""}
            placeholder="- Given [context], when [action], then [result]..."
          />
        </TabsContent>

        <TabsContent value="questions" className="pt-4">
          <OpenQuestionsEditor
            prdId={prd.id}
            initialQuestions={parseJson<OpenQuestion[]>(prd.openQuestions, [])}
          />
        </TabsContent>

        <TabsContent value="evidence" className="pt-4">
          <SectionEditor
            prdId={prd.id}
            section="evidence"
            label="Evidence"
            initialValue={prd.evidence ?? ""}
            placeholder="Supporting signals, quotes, data points..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
