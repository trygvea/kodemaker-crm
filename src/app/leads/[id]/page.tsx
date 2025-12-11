import { requireAuth } from "@/lib/require-auth";
import { LeadDetailClient } from "./lead-detail-client";

export default async function LeadDetailPage() {
  await requireAuth();
  return <LeadDetailClient />;
}
