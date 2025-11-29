import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default {
  default: <Input placeholder="Enter text..." />,
  withLabel: (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
  password: (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="••••••••" />
    </div>
  ),
  disabled: <Input placeholder="Disabled input" disabled />,
  invalid: <Input placeholder="Invalid input" aria-invalid="true" />,
  withValue: <Input defaultValue="Pre-filled value" />,
}
