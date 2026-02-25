"use server";

import { db } from "@/lib/db";
import {
  signals,
  problems,
  signalProblems,
  objectives,
  releases,
  roadmapItems,
  roadmapItemProblems,
  roadmapItemObjectives,
} from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// ─── Career Site / Product seed data ────────────────────

export async function seedCareerSiteData() {
  const now = new Date();

  // ─── Signals ─────────────────────────────────────────
  const sig1 = nanoid();
  const sig2 = nanoid();
  const sig3 = nanoid();
  const sig4 = nanoid();
  const sig5 = nanoid();
  const sig6 = nanoid();

  await db.insert(signals).values([
    {
      id: sig1,
      rawText:
        "Our apply flow takes 6+ clicks and candidates drop off at the resume upload step. We see 40% abandonment at that stage. Mobile completion is even worse — under 20%.",
      source: "support",
      customer: "TalentWorks Inc",
      arr: "$85k",
      severity: "high",
      frequency: "daily",
      status: "processed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sig2,
      rawText:
        "Recruiters can't tell which job posts are performing well vs. poorly. They want a dashboard showing views, applies, and conversion rates per listing without exporting to spreadsheets.",
      source: "sales",
      customer: "HireRight Solutions",
      arr: "$120k",
      severity: "medium",
      frequency: "weekly",
      status: "processed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sig3,
      rawText:
        "Candidates keep asking us when they'll hear back. Our status page just says 'Application Received' with no timeline. Competitors show estimated review dates and stage progress.",
      source: "support",
      customer: "JobSeekerPro",
      arr: "$45k",
      severity: "medium",
      frequency: "daily",
      status: "processed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sig4,
      rawText:
        "Enterprise clients need SSO and SCIM provisioning before they can roll out to their full recruiting teams. We've lost 3 deals over $200k each because of this.",
      source: "sales",
      customer: "MegaCorp HR",
      arr: "$250k",
      severity: "critical",
      frequency: "monthly",
      status: "processed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sig5,
      rawText:
        "Our career pages look identical across all customers. Employers want custom branding — their logo, colors, hero images — to make the page feel like their own site, not a generic portal.",
      source: "research",
      customer: "BrandFirst Agency",
      arr: "$60k",
      severity: "medium",
      frequency: "weekly",
      status: "new",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sig6,
      rawText:
        "International clients need the application form and career page in multiple languages. Right now everything is English-only. French and German are the top requests.",
      source: "support",
      customer: "EuroStaff GmbH",
      arr: "$95k",
      severity: "high",
      frequency: "weekly",
      status: "new",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Problems ────────────────────────────────────────
  const prob1 = nanoid();
  const prob2 = nanoid();
  const prob3 = nanoid();
  const prob4 = nanoid();
  const prob5 = nanoid();

  await db.insert(problems).values([
    {
      id: prob1,
      title: "High application abandonment rate",
      statement:
        "Candidates abandon the application flow at a 40% rate, primarily at the resume upload step. The multi-step form requires too many clicks and doesn't save progress, causing mobile users to have a sub-20% completion rate.",
      whoAffected: "Job applicants and hiring managers",
      workflowBlock: "Candidate can't complete application in one session",
      businessImpact:
        "Employers see fewer qualified applicants, reducing hiring velocity and customer satisfaction",
      retentionOrGrowth: "retention",
      severity: "critical",
      frequency: "daily",
      status: "accepted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: prob2,
      title: "No visibility into job post performance",
      statement:
        "Recruiters have no way to see which job listings are driving views, applications, and hires. They resort to manual spreadsheet exports and guesswork to evaluate which posts need attention.",
      whoAffected: "Recruiters and hiring managers",
      workflowBlock: "Can't optimize underperforming job posts",
      businessImpact:
        "Clients can't justify ROI without data, leads to churn",
      retentionOrGrowth: "retention",
      severity: "high",
      frequency: "weekly",
      status: "accepted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: prob3,
      title: "Candidates lack application status transparency",
      statement:
        "After submitting an application, candidates see only 'Application Received' with no estimated timeline or stage indicators. This creates anxiety and increases support tickets as candidates repeatedly check in.",
      whoAffected: "Job applicants",
      workflowBlock: "No self-serve status tracking for candidates",
      businessImpact:
        "High support volume, poor candidate experience hurts employer brand",
      retentionOrGrowth: "growth",
      severity: "medium",
      frequency: "daily",
      status: "proposed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: prob4,
      title: "Enterprise deals blocked by missing SSO/SCIM",
      statement:
        "Enterprise prospects require SSO (SAML/OIDC) and SCIM user provisioning as prerequisites for procurement. Without these, security reviews fail and deals exceeding $200k ARR are lost.",
      whoAffected: "Enterprise IT teams and our sales team",
      workflowBlock: "Enterprise security review can't pass",
      businessImpact:
        "Lost $600k+ pipeline in last quarter from 3 blocked deals",
      retentionOrGrowth: "growth",
      severity: "critical",
      frequency: "monthly",
      status: "accepted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: prob5,
      title: "Generic career pages reduce employer brand value",
      statement:
        "All customer career pages use the same template with no customization. Employers can't showcase their brand identity, making the pages feel generic and reducing the perceived value of the platform.",
      whoAffected: "Employers and their employer branding teams",
      workflowBlock: "Can't differentiate career page from competitors",
      businessImpact:
        "Mid-market churn risk — employers want pages that feel like their own site",
      retentionOrGrowth: "retention",
      severity: "medium",
      frequency: "weekly",
      status: "shaped",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Signal → Problem links ──────────────────────────
  await db.insert(signalProblems).values([
    {
      id: nanoid(),
      signalId: sig1,
      problemId: prob1,
      quote: "40% abandonment at resume upload step",
    },
    {
      id: nanoid(),
      signalId: sig2,
      problemId: prob2,
      quote: "can't tell which job posts are performing well vs. poorly",
    },
    {
      id: nanoid(),
      signalId: sig3,
      problemId: prob3,
      quote: "status page just says 'Application Received' with no timeline",
    },
    {
      id: nanoid(),
      signalId: sig4,
      problemId: prob4,
      quote: "lost 3 deals over $200k each because of this",
    },
    {
      id: nanoid(),
      signalId: sig5,
      problemId: prob5,
      quote: "career pages look identical across all customers",
    },
  ]);

  // ─── Objectives ──────────────────────────────────────
  const obj1 = nanoid();
  const obj2 = nanoid();
  const obj3 = nanoid();

  await db.insert(objectives).values([
    {
      id: obj1,
      name: "Increase applicant conversion rate to 60%",
      timeframe: "Q2 2025",
      metric: "Application completion rate",
      weight: 3.0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: obj2,
      name: "Close $1M in enterprise ARR",
      timeframe: "Q3 2025",
      metric: "New enterprise bookings",
      weight: 5.0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: obj3,
      name: "Reduce customer churn below 5%",
      timeframe: "Q2 2025",
      metric: "Monthly logo churn rate",
      weight: 4.0,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Releases ──────────────────────────────────────
  const rel1 = nanoid();
  const rel2 = nanoid();

  await db.insert(releases).values([
    {
      id: rel1,
      name: "v2.0 \u2014 Conversion & Analytics",
      description: "First major release focusing on application conversion and recruiter analytics",
      targetDate: "2025-05-31",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: rel2,
      name: "v2.1 \u2014 Enterprise",
      description: "Enterprise authentication and provisioning features",
      targetDate: "2025-07-31",
      status: "planned",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Roadmap Items ───────────────────────────────────
  const ri1 = nanoid(); // initiative: Streamline Apply
  const ri2 = nanoid(); // initiative: Analytics Dashboard
  const ri3 = nanoid(); // initiative: Enterprise Auth
  const ep1 = nanoid(); // epic: Apply UX Overhaul
  const ep2 = nanoid(); // epic: Core Analytics
  const ep3 = nanoid(); // epic: Identity & Access
  const ri4 = nanoid(); // feature: One-click apply
  const ri5 = nanoid(); // feature: Resume parser
  const ri6 = nanoid(); // feature: Job post metrics
  const ri7 = nanoid(); // feature: SSO (SAML)
  const ri8 = nanoid(); // feature: SCIM provisioning

  function rice(r: number, i: number, c: number, e: number) {
    return Math.round(((r * i * c) / e) * 10) / 10;
  }

  await db.insert(roadmapItems).values([
    // ── Initiatives ──
    {
      id: ri1,
      title: "Streamline Application Flow",
      description:
        "Redesign the apply experience to be completable in 3 clicks or fewer, with autosave, mobile-first layout, and LinkedIn/resume auto-fill.",
      rationale: "Directly addresses 40% abandonment \u2014 biggest lever on conversion",
      type: "initiative",
      status: "committed",
      targetMonth: "2025-04",
      effortSize: "L",
      reach: 8,
      impact: 9,
      confidence: 7,
      effort: 6,
      score: rice(8, 9, 7, 6),
      parentId: null,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri2,
      title: "Recruiter Analytics Dashboard",
      description:
        "Build a real-time dashboard showing views, applies, conversion rates, and source attribution per job listing.",
      rationale: "Recruiters can't optimize what they can't measure \u2014 key retention lever",
      type: "initiative",
      status: "committed",
      targetMonth: "2025-05",
      effortSize: "M",
      reach: 6,
      impact: 7,
      confidence: 8,
      effort: 5,
      score: rice(6, 7, 8, 5),
      parentId: null,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri3,
      title: "Enterprise Authentication & Provisioning",
      description:
        "Implement SAML SSO, OIDC, and SCIM user provisioning to unblock enterprise procurement and security review.",
      rationale: "$600k+ pipeline blocked \u2014 highest revenue impact",
      type: "initiative",
      status: "committed",
      targetMonth: "2025-06",
      effortSize: "XL",
      reach: 3,
      impact: 10,
      confidence: 9,
      effort: 8,
      score: rice(3, 10, 9, 8),
      parentId: null,
      releaseId: rel2,
      createdAt: now,
      updatedAt: now,
    },
    // ── Epics ──
    {
      id: ep1,
      title: "Apply UX Overhaul",
      description:
        "Complete redesign of the apply form: reduce steps, add autosave, optimize for mobile, integrate LinkedIn.",
      rationale: "Core execution track under Streamline Application Flow initiative",
      type: "epic",
      status: "committed",
      targetMonth: "2025-04",
      effortSize: "M",
      reach: 8,
      impact: 8,
      confidence: 7,
      effort: 5,
      score: rice(8, 8, 7, 5),
      parentId: ri1,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ep2,
      title: "Core Analytics",
      description:
        "Build the data pipeline and dashboard UI for per-listing performance metrics and source attribution.",
      rationale: "Foundation for all recruiter analytics features",
      type: "epic",
      status: "proposed",
      targetMonth: "2025-05",
      effortSize: "M",
      reach: 6,
      impact: 7,
      confidence: 7,
      effort: 4,
      score: rice(6, 7, 7, 4),
      parentId: ri2,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ep3,
      title: "Identity & Access",
      description:
        "Implement enterprise-grade identity: SAML 2.0, OIDC, and SCIM 2.0 provisioning with major IdP support.",
      rationale: "Unblocks all enterprise auth-gated deals",
      type: "epic",
      status: "committed",
      targetMonth: "2025-06",
      effortSize: "L",
      reach: 3,
      impact: 9,
      confidence: 8,
      effort: 7,
      score: rice(3, 9, 8, 7),
      parentId: ri3,
      releaseId: rel2,
      createdAt: now,
      updatedAt: now,
    },
    // ── Features ──
    {
      id: ri4,
      title: "One-Click Apply with LinkedIn",
      description:
        "Let candidates apply using their LinkedIn profile with a single click. Auto-fill name, experience, and resume.",
      type: "feature",
      status: "in-progress",
      targetMonth: "2025-04",
      effortSize: "M",
      reach: 8,
      impact: 8,
      confidence: 6,
      effort: 4,
      score: rice(8, 8, 6, 4),
      parentId: ep1,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri5,
      title: "AI Resume Parser & Auto-Fill",
      description:
        "Parse uploaded resumes using AI to auto-fill application fields. Supports PDF, DOCX, and plain text formats.",
      type: "feature",
      status: "proposed",
      targetMonth: "2025-05",
      effortSize: "M",
      reach: 7,
      impact: 7,
      confidence: 5,
      effort: 5,
      score: rice(7, 7, 5, 5),
      parentId: ep1,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri6,
      title: "Per-Listing Performance Metrics",
      description:
        "Show views, unique visitors, apply rate, time-to-apply, and source breakdown for each job listing in a dedicated metrics tab.",
      type: "feature",
      status: "proposed",
      targetMonth: "2025-05",
      effortSize: "S",
      reach: 6,
      impact: 6,
      confidence: 8,
      effort: 3,
      score: rice(6, 6, 8, 3),
      parentId: ep2,
      releaseId: rel1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri7,
      title: "SAML SSO Integration",
      description:
        "Support SAML 2.0 SSO with Okta, Azure AD, and OneLogin. Include SP-initiated and IdP-initiated flows.",
      type: "feature",
      status: "committed",
      targetMonth: "2025-06",
      effortSize: "L",
      reach: 3,
      impact: 9,
      confidence: 8,
      effort: 6,
      score: rice(3, 9, 8, 6),
      parentId: ep3,
      releaseId: rel2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ri8,
      title: "SCIM User Provisioning",
      description:
        "Implement SCIM 2.0 endpoints for automated user lifecycle management \u2014 create, update, deactivate users from IdP.",
      type: "feature",
      status: "proposed",
      targetMonth: "2025-07",
      effortSize: "L",
      reach: 2,
      impact: 8,
      confidence: 7,
      effort: 7,
      score: rice(2, 8, 7, 7),
      parentId: ep3,
      releaseId: rel2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Roadmap Item → Problem links ────────────────────
  await db.insert(roadmapItemProblems).values([
    { id: nanoid(), roadmapItemId: ri1, problemId: prob1 },
    { id: nanoid(), roadmapItemId: ep1, problemId: prob1 },
    { id: nanoid(), roadmapItemId: ri4, problemId: prob1 },
    { id: nanoid(), roadmapItemId: ri5, problemId: prob1 },
    { id: nanoid(), roadmapItemId: ri2, problemId: prob2 },
    { id: nanoid(), roadmapItemId: ep2, problemId: prob2 },
    { id: nanoid(), roadmapItemId: ri6, problemId: prob2 },
    { id: nanoid(), roadmapItemId: ri3, problemId: prob4 },
    { id: nanoid(), roadmapItemId: ep3, problemId: prob4 },
    { id: nanoid(), roadmapItemId: ri7, problemId: prob4 },
    { id: nanoid(), roadmapItemId: ri8, problemId: prob4 },
  ]);

  // ─── Roadmap Item → Objective links ──────────────────
  await db.insert(roadmapItemObjectives).values([
    { id: nanoid(), roadmapItemId: ri1, objectiveId: obj1, impactToObjective: 9 },
    { id: nanoid(), roadmapItemId: ri2, objectiveId: obj3, impactToObjective: 7 },
    { id: nanoid(), roadmapItemId: ri3, objectiveId: obj2, impactToObjective: 10 },
  ]);

  // Revalidate all pages
  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/problems");
  revalidatePath("/objectives");
  revalidatePath("/roadmap");
  revalidatePath("/graph");
  revalidatePath("/discovery");

  return {
    signals: 6,
    problems: 5,
    objectives: 3,
    releases: 2,
    roadmapItems: 11,
  };
}

export async function clearAllData() {
  // Delete in dependency order (junction tables first, then entities)
  await db.delete(roadmapItemObjectives);
  await db.delete(roadmapItemProblems);
  await db.delete(signalProblems);
  await db.delete(roadmapItems);
  await db.delete(releases);
  await db.delete(problems);
  await db.delete(objectives);
  await db.delete(signals);

  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/problems");
  revalidatePath("/objectives");
  revalidatePath("/roadmap");
  revalidatePath("/graph");
  revalidatePath("/discovery");
}
