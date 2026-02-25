# Foundry AI — PM Command Center

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Drizzle ORM · SQLite (better-sqlite3) · Zod v4 · React Hook Form

## Commands
- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run db:push` — push schema changes to SQLite
- `npm run db:studio` — open Drizzle Studio

## Structure
```
src/app/         — pages (discovery, roadmap, graph, inbox, problems, prds, objectives)
src/lib/db/      — Drizzle schema + connection
src/lib/actions/ — server actions (CRUD per entity + graph.ts)
src/lib/validators/ — Zod schemas
src/components/  — UI components (layout, discovery, signals, problems, objectives, roadmap, prds, graph, shared)
```

## Data Model
Signals → Problems (via signal_problems with quotes) → Roadmap Items (via roadmap_item_problems)
Objectives → Roadmap Items (via roadmap_item_objectives)
Roadmap Items: Initiative > Epic > Feature (parentId hierarchy)
Releases → Roadmap Items (via releaseId FK, cross-cutting milestone grouping)
Roadmap Items → PRDs → PRD Messages, Ticket Stubs
Score = (reach × impact × confidence) / effort

## Key Patterns
- All PKs are nanoid text strings
- Timestamps are `integer` mode `"timestamp"` (Drizzle)
- JSON fields (PRD sections like userStories, openQuestions) stored as text, parsed with Zod
- Server actions in `src/lib/actions/` use `"use server"` + `revalidatePath`
- Forms use react-hook-form + zodResolver; use `valueAsNumber` for number inputs (Zod v4 `z.coerce` has input type `unknown`)
- Form `defaultValues` props use `Record<string, any>` to handle null↔undefined mismatch from DB

## AI Features (Phase 1)
- AI SDK v6 (`ai@6.x`) + `@ai-sdk/react` + `@ai-sdk/openai` + `@ai-sdk/anthropic`
- `useChat` from `@ai-sdk/react` requires `DefaultChatTransport` from `ai` for `api`/`body` options
- API route uses `result.toUIMessageStreamResponse()` (not `toDataStreamResponse`)
- Messages use `UIMessage` format with `parts` array (not `content` string)
- `src/lib/ai/` — provider config, extract.ts (signal analysis), score.ts (RICE scoring), prd-chat.ts (system prompt)
- `src/lib/actions/ai-signals.ts` — analyzeSignal, acceptSuggestedProblem
- `src/lib/actions/ai-roadmap.ts` — suggestItemScore, applyScoreSuggestion
- Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in `.env.local`

## Discovery
- `/discovery` — guided two-phase workflow: Signals → Problems
- Phase selector with framework descriptions, collapsible guide cards, stats bar
- Embeds signal + problem CRUD inline (reuses existing forms + AI analysis)
- Sidebar nav: Discovery replaces separate Inbox/Problems links (those pages still exist for deep links)

## Strategy Graph (Phase 1)
- `@xyflow/react` for interactive node graph + `elkjs` for hierarchical auto-layout (NOT dagre — dagre's ESM bundle uses internal `require()` calls that break Turbopack)
- Graph page uses `ssr: false` via client wrapper (`graph-loader.tsx`)
- `react-resizable-panels` v4: exports are `Group`, `Panel`, `Separator` (not `PanelGroup`/`PanelResizeHandle`); uses `orientation` prop (not `direction`)
- `src/lib/actions/graph.ts` — `getGraphData()`, `getOrphanCounts()`
- Relationship gating: `updateProblem` blocks "accepted" without linked roadmap item; `updateRoadmapItem` blocks "committed" without required objective/problem/parent links (initiatives need objectives+problems; epics need parent initiative+problems; features need parent epic+problems)
- Orphan detection flags: accepted problems without roadmap items, committed items without objectives or accepted problems
- Graph node types: objective, initiative, epic, feature, problem, signal (epic is green-themed)

## Notes
- No auth (single-user local tool)
- Node.js via nvm: `export PATH="$HOME/.nvm/versions/node/v22.21.0/bin:$PATH"`
- Git repo root is `~/` (parent directory)
