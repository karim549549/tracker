"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FeatureCard } from "@/shared/types";

interface DrawerFormFeatureProps {
  draft: Partial<FeatureCard>;
  onChange: (patch: Partial<FeatureCard>) => void;
}

export function DrawerFormFeature({ draft, onChange }: DrawerFormFeatureProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="plan">Implementation Plan</Label>
      <Textarea
        id="plan"
        value={draft.implementationPlan ?? ""}
        onChange={(e) => onChange({ implementationPlan: e.target.value })}
        placeholder="Outline the implementation steps..."
        rows={6}
        className="resize-none"
      />
    </div>
  );
}
