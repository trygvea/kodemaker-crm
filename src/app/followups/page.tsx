import { requireAuth } from "@/lib/require-auth";
import { FollowupsClient } from "./followups-client";

export default async function FollowupsPage() {
  await requireAuth();
  return <FollowupsClient />;
}
