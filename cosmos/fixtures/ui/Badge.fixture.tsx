import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default {
  variants: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Badge Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="tertiary">Tertiary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="bortfalt">Bortfalt</Badge>
        </div>
      </div>
    </div>
  ),
  withIcon: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Badges with Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <Check className="h-3 w-3" />
            Verified
          </Badge>
          <Badge variant="secondary">
            <Check className="h-3 w-3" />
            Active
          </Badge>
          <Badge variant="tertiary">
            <Check className="h-3 w-3" />
            In Progress
          </Badge>
        </div>
      </div>
    </div>
  ),
};
