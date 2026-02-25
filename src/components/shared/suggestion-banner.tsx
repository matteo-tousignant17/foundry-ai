import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionBannerProps {
  count: number;
  message: string;
  actionLabel: string;
  actionHref: string;
}

export function SuggestionBanner({
  count,
  message,
  actionLabel,
  actionHref,
}: SuggestionBannerProps) {
  if (count === 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm">
          <span className="font-semibold">{count}</span> {message}
        </p>
      </div>
      <Link href={actionHref}>
        <Button size="sm" variant="outline">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}
