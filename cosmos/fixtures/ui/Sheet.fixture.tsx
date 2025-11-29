import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default {
    closed: (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Åpne panel</Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Meny</SheetTitle>
                    <SheetDescription>
                        Et eksempel på et sidepanel som brukes til navigasjon.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
    open: (
        <Sheet defaultOpen>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Meny</SheetTitle>
                    <SheetDescription>
                        Et eksempel på et sidepanel som brukes til navigasjon.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
};
