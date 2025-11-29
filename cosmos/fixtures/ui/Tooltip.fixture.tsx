import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export default {
  default: (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hold over meg</Button>
        </TooltipTrigger>
        <TooltipContent>Viser mer informasjon om handlingen.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}


