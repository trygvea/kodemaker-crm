import { Button } from "@/components/ui/button";
import { Save, Trash2, X } from "lucide-react";

export default {
  colors: (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-primary"></div>
            <p className="text-sm font-medium">Primary</p>
            <p className="text-xs text-muted-foreground">Main actions</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-secondary"></div>
            <p className="text-sm font-medium">Secondary</p>
            <p className="text-xs text-muted-foreground">Background</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-secondary-green"></div>
            <p className="text-sm font-medium">Secondary Green</p>
            <p className="text-xs text-muted-foreground">Active status</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-tertiary"></div>
            <p className="text-sm font-medium">Tertiary</p>
            <p className="text-xs text-muted-foreground">In-progress</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-accent"></div>
            <p className="text-sm font-medium">Accent</p>
            <p className="text-xs text-muted-foreground">Highlights</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-destructive"></div>
            <p className="text-sm font-medium">Destructive</p>
            <p className="text-xs text-muted-foreground">Delete/Error</p>
          </div>
        </div>
      </div>
    </div>
  ),
  buttons: (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Button Sizes</h3>
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">With Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  ),
  typography: (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Typography Scale</h2>
      <div className="space-y-2">
        <p className="text-2xl font-semibold">Heading 2XL</p>
        <p className="text-xl font-semibold">Heading XL</p>
        <p className="text-lg font-semibold">Heading LG</p>
        <p className="text-base">Body Base</p>
        <p className="text-sm">Body Small</p>
        <p className="text-xs">Body XS</p>
      </div>
      <div className="space-y-2 mt-4">
        <p className="text-sm text-muted-foreground">Muted foreground text</p>
        <p className="text-sm font-medium">Medium weight text</p>
        <p className="text-sm font-semibold">Semibold weight text</p>
      </div>
    </div>
  ),
  spacing: (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Spacing Scale</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-1 h-4 bg-primary"></div>
          <span className="text-sm">1 (4px)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-4 bg-primary"></div>
          <span className="text-sm">2 (8px)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-3 h-4 bg-primary"></div>
          <span className="text-sm">3 (12px)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-primary"></div>
          <span className="text-sm">4 (16px)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-4 bg-primary"></div>
          <span className="text-sm">6 (24px)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-4 bg-primary"></div>
          <span className="text-sm">8 (32px)</span>
        </div>
      </div>
    </div>
  ),
};
