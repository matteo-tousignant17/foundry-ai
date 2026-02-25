"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeType } from "@/lib/actions/graph";

const NODE_TYPE_LABELS: { type: GraphNodeType; label: string; color: string }[] = [
  { type: "objective", label: "Objectives", color: "bg-purple-600" },
  { type: "initiative", label: "Initiatives", color: "bg-blue-600" },
  { type: "epic", label: "Epics", color: "bg-green-600" },
  { type: "feature", label: "Features", color: "bg-cyan-600" },
  { type: "problem", label: "Problems", color: "bg-amber-600" },
  { type: "signal", label: "Signals", color: "bg-gray-500" },
];

const STATUS_OPTIONS = [
  "proposed",
  "committed",
  "in-progress",
  "done",
  "draft",
  "shaped",
  "accepted",
  "new",
  "processed",
];

interface GraphFiltersProps {
  objectives: { id: string; name: string }[];
  activeObjectives: Set<string>;
  onToggleObjective: (id: string) => void;
  activeTypes: Set<GraphNodeType>;
  onToggleType: (type: GraphNodeType) => void;
  activeStatuses: Set<string>;
  onToggleStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function GraphFilters({
  objectives,
  activeObjectives,
  onToggleObjective,
  activeTypes,
  onToggleType,
  activeStatuses,
  onToggleStatus,
  searchQuery,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: GraphFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-2 border-b bg-muted/20">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search nodes..."
          className="h-7 w-40 pl-7 text-xs"
        />
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Type toggles */}
      {NODE_TYPE_LABELS.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onToggleType(type)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            activeTypes.has(type)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", color)} />
          {label}
        </button>
      ))}

      {/* Objective chips */}
      {objectives.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          {objectives.map((obj) => (
            <Badge
              key={obj.id}
              variant="outline"
              className={cn(
                "cursor-pointer text-xs transition-colors",
                activeObjectives.has(obj.id)
                  ? "bg-purple-900/30 border-purple-600 text-purple-300"
                  : "opacity-40 hover:opacity-70"
              )}
              onClick={() => onToggleObjective(obj.id)}
            >
              {obj.name}
            </Badge>
          ))}
        </>
      )}

      {/* Status toggles */}
      <div className="h-4 w-px bg-border" />
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onToggleStatus(s)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors capitalize",
              activeStatuses.has(s)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onClearFilters}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
