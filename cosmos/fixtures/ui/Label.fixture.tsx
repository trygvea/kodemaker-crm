import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default {
  default: <Label htmlFor="name">Navn</Label>,
  withInput: (
    <div className="space-y-2">
      <Label htmlFor="name">Navn</Label>
      <Input id="name" placeholder="For- og etternavn" />
    </div>
  ),
}


