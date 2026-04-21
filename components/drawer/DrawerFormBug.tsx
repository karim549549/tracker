"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { BugCard } from "@/shared/types";

interface DrawerFormBugProps {
  draft: Partial<BugCard>;
  onChange: (patch: Partial<BugCard>) => void;
}

export function DrawerFormBug({ draft, onChange }: DrawerFormBugProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reason">Root Cause</Label>
        <Textarea
          id="reason"
          value={draft.reason ?? ""}
          onChange={(e) => onChange({ reason: e.target.value })}
          placeholder="What caused this bug?"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="verified"
          checked={draft.isCauseVerified ?? false}
          onCheckedChange={(v) => onChange({ isCauseVerified: Boolean(v) })}
        />
        <Label htmlFor="verified" className="cursor-pointer">
          Cause has been verified
        </Label>
      </div>
    </div>
  );
}
