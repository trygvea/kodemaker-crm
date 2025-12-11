import { FollowupsList } from "@/components/followups-list";
import { delay, http, HttpResponse } from "msw";
import { useFixtureHandlers } from "../../mocks/msw-worker";

function LoadingFollowupsList() {
  useFixtureHandlers([
    http.get("/api/followups", async () => {
      await delay("infinite");
      return HttpResponse.json([]);
    }),
  ]);
  return <FollowupsList endpoint="/api/followups?all=1" />;
}

export default {
  default: <FollowupsList endpoint="/api/followups?all=1" />,
  loading: <LoadingFollowupsList />,
};
