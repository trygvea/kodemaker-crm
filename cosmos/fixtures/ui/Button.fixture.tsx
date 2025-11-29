import { Button } from '@/components/ui/button'

export default {
  default: <Button>Default Button</Button>,
  destructive: <Button variant="destructive">Destructive</Button>,
  outline: <Button variant="outline">Outline</Button>,
  secondary: <Button variant="secondary">Secondary</Button>,
  ghost: <Button variant="ghost">Ghost</Button>,
  link: <Button variant="link">Link</Button>,
  sizes: (
    <div className="flex flex-col gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🚀</Button>
    </div>
  ),
  disabled: <Button disabled>Disabled</Button>,
  withIcon: (
    <Button>
      <span>🚀</span>
      Launch
    </Button>
  ),
}
