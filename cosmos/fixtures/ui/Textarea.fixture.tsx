import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default {
  default: <Textarea placeholder="Skriv en kommentar..." />,
  withLabel: (
    <div className="space-y-2">
      <Label htmlFor="comment">Kommentar</Label>
      <Textarea id="comment" placeholder="Skriv en kommentar..." />
    </div>
  ),
  disabled: <Textarea placeholder="Kan ikke redigeres" disabled />,
}


