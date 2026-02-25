import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return <Badge variant="outline" className="text-muted-foreground">Unscored</Badge>;
  }

  const color =
    score > 7
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : score >= 4
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <Badge variant="outline" className={cn("font-mono", color)}>
      {score.toFixed(1)}
    </Badge>
  );
}
