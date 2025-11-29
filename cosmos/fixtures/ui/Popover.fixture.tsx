import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default {
  default: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Velg dato</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">Innholdet her kan være en kalender eller filtervalg.</PopoverContent>
    </Popover>
  ),
}


