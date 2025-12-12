import { useState } from "react";
import { MergeContactsDialog } from "@/components/merge-contacts-dialog";
import { Button } from "@/components/ui/button";

const SOURCE_CONTACT = {
  id: 1,
  firstName: "Kari",
  lastName: "Nordmann",
};

const COUNTS = {
  emailAddresses: 2,
  emails: 5,
  leads: 1,
  comments: 3,
  events: 4,
  followups: 2,
};

function MergeContactsDialogFixture() {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-3">
      <MergeContactsDialog
        open={open}
        onOpenChange={setOpen}
        sourceContact={SOURCE_CONTACT}
        contactCounts={COUNTS}
        onMerge={async () => setOpen(false)}
      />
      {!open && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Åpne dialog
        </Button>
      )}
    </div>
  );
}

export default {
  default: <MergeContactsDialogFixture />,
};
