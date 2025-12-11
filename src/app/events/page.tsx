import { requireAuth } from "@/lib/require-auth";
import { EventsClient } from "./events-client";

export default async function EventsPage() {
  await requireAuth();
  return <EventsClient />;
}
