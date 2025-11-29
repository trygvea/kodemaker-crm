import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default {
  closed: (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Åpne dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny oppfølging</DialogTitle>
          <DialogDescription>Opprett en ny oppgave for denne kontakten.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  open: (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny oppfølging</DialogTitle>
          <DialogDescription>Opprett en ny oppgave for denne kontakten.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}


