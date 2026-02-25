export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PrdEditor } from "@/components/prds/prd-editor";
import { PrdChat } from "@/components/prds/prd-chat";
import { getPrd } from "@/lib/actions/prds";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PrdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prd = await getPrd(id);

  if (!prd) notFound();

  return (
    <div className="h-[calc(100vh-3rem)]">
      <div className="mb-4">
        <Link href="/prds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PRDs
          </Button>
        </Link>
      </div>
      <PageHeader title={prd.title} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-6rem)]">
        <div className="lg:col-span-2 overflow-y-auto">
          <PrdEditor prd={prd} />
        </div>
        <div className="lg:col-span-1 min-h-[400px]">
          <PrdChat prdId={prd.id} />
        </div>
      </div>
    </div>
  );
}
