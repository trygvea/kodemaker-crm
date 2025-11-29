import { Badge } from '@/components/ui/badge'

export default {
  default: <Badge>Default</Badge>,
  secondary: <Badge variant="secondary">Secondary</Badge>,
  destructive: <Badge variant="destructive">Destructive</Badge>,
  outline: <Badge variant="outline">Outline</Badge>,
  withIcon: (
    <Badge>
      <span>✓</span>
      Verified
    </Badge>
  ),
}
