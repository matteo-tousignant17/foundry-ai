"use client";

import { useState, useTransition } from "react";
import {
  User,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedCareerSiteData, clearAllData } from "@/lib/actions/seed";
import { toast } from "sonner";

export function ProfilePane() {
  const [open, setOpen] = useState(false);
  const [seeding, startSeed] = useTransition();
  const [clearing, startClear] = useTransition();
  const [seeded, setSeeded] = useState(false);

  function handleSeed() {
    startSeed(async () => {
      try {
        const result = await seedCareerSiteData();
        setSeeded(true);
        toast.success(
          `Seeded ${result.signals} signals, ${result.problems} problems, ${result.objectives} objectives, ${result.roadmapItems} roadmap items`
        );
        setTimeout(() => setSeeded(false), 3000);
      } catch {
        toast.error("Failed to seed data");
      }
    });
  }

  function handleClear() {
    startClear(async () => {
      try {
        await clearAllData();
        toast.success("All data cleared");
      } catch {
        toast.error("Failed to clear data");
      }
    });
  }

  return (
    <div className="border-t">
      {/* Expanded seed options */}
      {open && (
        <div className="border-b px-3 py-2 space-y-1.5 animate-in slide-in-from-bottom-2 fade-in duration-150">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Quick Seed
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-8"
            onClick={handleSeed}
            disabled={seeding || clearing}
          >
            {seeding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : seeded ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span className="flex-1 text-left text-xs">Career Site</span>
            <span className="text-[10px] text-muted-foreground">22</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleClear}
            disabled={seeding || clearing}
          >
            {clearing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Clear All Data</span>
          </Button>
        </div>
      )}

      {/* Profile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium truncate">Local PM</p>
          <p className="text-[10px] text-muted-foreground">Single-user</p>
        </div>
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
      </button>
    </div>
  );
}
