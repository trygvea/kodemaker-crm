import { ActivityLog } from "@/components/activity-log";
import { http, HttpResponse } from "msw";
import { INITIAL_MOCK_STATE } from "../../mocks/state";
import { useFixtureHandlers } from "../../mocks/msw-worker";

function DefaultActivityLog() {
  const ready = useFixtureHandlers([
    http.get("/api/followups", ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get("completed") === "1") {
        return HttpResponse.json(INITIAL_MOCK_STATE.completedFollowups);
      }
      return HttpResponse.json(INITIAL_MOCK_STATE.followups);
    }),
    http.get("/api/comments", () => HttpResponse.json(INITIAL_MOCK_STATE.comments)),
    http.get("/api/emails", () => HttpResponse.json(INITIAL_MOCK_STATE.emails)),
    http.get("/api/users", () => HttpResponse.json(INITIAL_MOCK_STATE.users)),
  ]);
  if (!ready) return null;
  return <ActivityLog contactId={1} companyId={1} initialEmails={INITIAL_MOCK_STATE.emails} />;
}

function EmptyActivityLog() {
  const ready = useFixtureHandlers([
    http.get("/api/followups", () => HttpResponse.json([])),
    http.get("/api/comments", () => HttpResponse.json([])),
    http.get("/api/emails", () => HttpResponse.json([])),
    http.get("/api/users", () => HttpResponse.json([])),
  ]);
  if (!ready) return null;
  return <ActivityLog contactId={1} />;
}

export default {
  default: <DefaultActivityLog />,
  empty: <EmptyActivityLog />,
};
