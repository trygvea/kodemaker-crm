import { Separator } from '@/components/ui/separator'

export default {
  horizontal: (
    <div className="w-80 space-y-4">
      <p>Liste over oppfølginger</p>
      <Separator />
      <p>Historikk</p>
    </div>
  ),
  vertical: (
    <div className="flex h-20 items-center space-x-4">
      <span>Venstre</span>
      <Separator orientation="vertical" />
      <span>Høyre</span>
    </div>
  ),
}


