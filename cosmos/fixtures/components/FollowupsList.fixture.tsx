import { FollowupItem, FollowupsList } from "@/components/followups-list";
import { SWRConfig } from "swr";

const MOCK_FOLLOWUPS: FollowupItem[] = [
  {
    id: 1,
    note: "Følg opp tilbud sendt til Kodemaker.",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Ola", lastName: "Nordmann" },
    company: { id: 1, name: "Kodemaker" },
    contact: { id: 5, firstName: "Kari", lastName: "Nordmann" },
  },
  {
    id: 2,
    note: "Ring kunden og avklar neste steg.",
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function MockFollowupsList() {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => {
          if (url.includes("/api/followups?mock=1")) {
            return Promise.resolve(MOCK_FOLLOWUPS);
          }
          return Promise.resolve(null);
        },
      }}
    >
      <FollowupsList endpoint="/api/followups?mock=1" />
    </SWRConfig>
  );
}

function LoadingFollowupsList() {
  return (
    <SWRConfig
      value={{
        fetcher: () => {
          // Return a promise that never resolves to show loading state
          return new Promise<never>(() => {});
        },
        // Clear any cached data for this endpoint
        provider: () => new Map(),
      }}
    >
      <FollowupsList endpoint="/api/followups?mock=loading" />
    </SWRConfig>
  );
}

export default {
  default: <MockFollowupsList />,
  loading: <LoadingFollowupsList />,
};
