import { requireAuth } from "@/lib/require-auth";
import { ContactDetailClient } from "./contact-detail-client";

export default async function ContactDetailPage() {
  await requireAuth();
  return <ContactDetailClient />;
}
