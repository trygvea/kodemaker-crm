import { FollowupsList } from "@/components/followups-list";
import { delay, http, HttpResponse } from "msw";
import { INITIAL_MOCK_STATE } from "../../mocks/state";
import { useFixtureHandlers } from "../../mocks/msw-worker";

function DefaultFollowupsList() {
  const ready = useFixtureHandlers([
    http.get("/api/followups", () => HttpResponse.json(INITIAL_MOCK_STATE.followups)),
  ]);
  if (!ready) return null;
  return <FollowupsList endpoint="/api/followups?all=1" />;
}

function LoadingFollowupsList() {
  const ready = useFixtureHandlers([
    http.get("/api/followups", async () => {
      await delay("infinite");
      return HttpResponse.json([]);
    }),
  ]);
  if (!ready) return null;
  return <FollowupsList endpoint="/api/followups?all=1" />;
}

export default {
  default: <DefaultFollowupsList />,
  loading: <LoadingFollowupsList />,
};
