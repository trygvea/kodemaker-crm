import { ActivityLog } from "@/components/activity-log";
import { http, HttpResponse } from "msw";
import { INITIAL_MOCK_STATE } from "../../mocks/state";
import { useFixtureHandlers } from "../../mocks/msw-worker";

function EmptyActivityLog() {
  useFixtureHandlers([
    http.get("/api/followups", () => HttpResponse.json([])),
    http.get("/api/comments", () => HttpResponse.json([])),
    http.get("/api/emails", () => HttpResponse.json([])),
    http.get("/api/users", () => HttpResponse.json([])),
  ]);
  return <ActivityLog contactId={1} />;
}

export default {
  default: (
    <ActivityLog
      contactId={1}
      companyId={1}
      initialEmails={INITIAL_MOCK_STATE.emails}
    />
  ),
  empty: <EmptyActivityLog />,
};
