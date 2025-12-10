import { requireAuth } from "@/lib/require-auth";
import { ActiveLeadsClient } from "./active-leads-client";

export default async function ActiveLeadsPage() {
  await requireAuth();
  return <ActiveLeadsClient />;
}
