interface PrdContext {
  title: string;
  status: string;
  summary: string | null;
  problemStatement: string | null;
  objectives: string | null;
  userStories: string | null;
  acceptanceCriteria: string | null;
  openQuestions: string | null;
  evidence: string | null;
  designAssetLink: string | null;
  roadmapItem: {
    title: string;
    description: string | null;
    type: string;
    score: number | null;
  } | null;
}

export function buildPrdSystemPrompt(prd: PrdContext): string {
  const sections = [
    prd.summary && `**Summary:** ${prd.summary}`,
    prd.problemStatement && `**Problem Statement:** ${prd.problemStatement}`,
    prd.objectives && `**Objectives:** ${prd.objectives}`,
    prd.userStories && `**User Stories:** ${prd.userStories}`,
    prd.acceptanceCriteria && `**Acceptance Criteria:** ${prd.acceptanceCriteria}`,
    prd.openQuestions && `**Open Questions:** ${prd.openQuestions}`,
    prd.evidence && `**Evidence:** ${prd.evidence}`,
    prd.designAssetLink && `**Design Asset:** ${prd.designAssetLink}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const roadmapContext = prd.roadmapItem
    ? `\nLinked Roadmap Item: "${prd.roadmapItem.title}" (${prd.roadmapItem.type}, score: ${prd.roadmapItem.score ?? "unscored"})\nDescription: ${prd.roadmapItem.description ?? "none"}`
    : "";

  return `You are a product management assistant helping write and refine a PRD (Product Requirements Document).

CURRENT PRD: "${prd.title}" (Status: ${prd.status})
${roadmapContext}

CURRENT SECTIONS:
${sections || "(All sections are empty)"}

YOUR ROLE:
- Help the PM write, refine, and complete this PRD
- When suggesting changes to sections, format them clearly with the section name
- When drafting user stories, use the format: "As a [role], I want to [action], so that [benefit]"
- When drafting acceptance criteria, use Given/When/Then format
- Flag assumptions explicitly with [Assumption] tags
- If evidence is referenced, cite it. If not, label claims as [Needs Evidence]

PRD READINESS RULES:
- A PRD is "ready" when all open questions are either answered or accepted as risks, AND acceptance criteria exist
- Help the PM get to "ready" status by identifying gaps

RESPONSE GUIDELINES:
- Be concise and actionable
- When proposing section edits, clearly indicate which section and what the new content should be
- Use markdown formatting for clarity
- Prefix suggested section content with "**[Section: Name]**" so the PM knows where to apply it`;
}
