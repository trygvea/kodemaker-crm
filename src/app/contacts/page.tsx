import { requireAuth } from "@/lib/require-auth";
import { ContactsClient } from "./contacts-client";

export default async function ContactsSearchPage() {
  await requireAuth();
  return <ContactsClient />;
}
