import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default {
  default: (
    <Accordion type="single" collapsible className="w-80">
      <AccordionItem value="item-1">
        <AccordionTrigger>Organisasjon</AccordionTrigger>
        <AccordionContent>Detaljer om organisasjonen.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Kontakter</AccordionTrigger>
        <AccordionContent>Liste over kontakter tilknyttet organisasjonen.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
