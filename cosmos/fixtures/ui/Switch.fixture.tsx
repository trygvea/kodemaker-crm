import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  );
}

function SwitchChecked() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="checked-switch" defaultChecked />
      <Label htmlFor="checked-switch">Checked</Label>
    </div>
  );
}

function SwitchDisabled() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-switch" disabled />
      <Label htmlFor="disabled-switch">Disabled</Label>
    </div>
  );
}

export default {
  default: <SwitchDemo />,
  checked: <SwitchChecked />,
  disabled: <SwitchDisabled />,
};
