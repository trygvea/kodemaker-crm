import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, X } from "lucide-react";

export default {
  variants: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Button Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </div>
  ),
  sizes: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Button Sizes</h3>
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ),
  withIcons: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Buttons with Icons</h3>
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
  states: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Button States</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  ),
  hierarchy: (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Button Hierarchy</h3>
        <div className="flex items-center gap-2">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Tertiary</Button>
        </div>
      </div>
    </div>
  ),
};
