import { PageHeader } from "@/components/layout/page-header";
import { ObjectiveList } from "@/components/objectives/objective-list";
import { getObjectives } from "@/lib/actions/objectives";

export default async function ObjectivesPage() {
  const objectives = await getObjectives();

  return (
    <div>
      <PageHeader
        title="Objectives"
        description="Strategic objectives with weights for scoring"
      />
      <ObjectiveList objectives={objectives} />
    </div>
  );
}
