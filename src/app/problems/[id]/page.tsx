export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProblemDetail } from "@/components/problems/problem-detail";
import { getProblem } from "@/lib/actions/problems";
import { getSignals } from "@/lib/actions/signals";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [problem, allSignals] = await Promise.all([
    getProblem(id),
    getSignals(),
  ]);

  if (!problem) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/problems">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Button>
        </Link>
      </div>
      <PageHeader title={problem.title} />
      <ProblemDetail problem={problem} allSignals={allSignals} />
    </div>
  );
}
