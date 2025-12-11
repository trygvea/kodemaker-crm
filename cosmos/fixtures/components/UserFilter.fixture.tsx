import { useState } from "react";
import { SWRConfig } from "swr";
import {
  UserFilter,
  type UserFilterValue,
  type UserData,
} from "@/components/filters/user-filter";

const MOCK_USERS: UserData[] = [
  { id: 1, firstName: "Ola", lastName: "Nordmann" },
  { id: 2, firstName: "Kari", lastName: "Hansen" },
  { id: 3, firstName: "Per", lastName: "Olsen" },
  { id: 4, firstName: "Anne", lastName: "Berg" },
  { id: 5, firstName: "Erik", lastName: "Johansen" },
];

function InteractiveUserFilter({
  initialValue = "mine",
}: {
  initialValue?: UserFilterValue;
}) {
  const [value, setValue] = useState<UserFilterValue>(initialValue);

  return (
    <SWRConfig
      value={{
        fetcher: () => Promise.resolve(MOCK_USERS),
        provider: () => new Map(),
      }}
    >
      <div className="space-y-4">
        <UserFilter value={value} onChange={setValue} />
        <div className="text-sm text-muted-foreground">
          Current value:{" "}
          <code className="bg-muted px-1 py-0.5 rounded">
            {JSON.stringify(value)}
          </code>
        </div>
      </div>
    </SWRConfig>
  );
}

function LoadingUserFilter() {
  const [value, setValue] = useState<UserFilterValue>("mine");

  return (
    <SWRConfig
      value={{
        fetcher: () => new Promise<never>(() => {}),
        provider: () => new Map(),
      }}
    >
      <UserFilter value={value} onChange={setValue} />
    </SWRConfig>
  );
}

function FilteredStateUserFilter() {
  const [value, setValue] = useState<UserFilterValue>("all");

  return (
    <SWRConfig
      value={{
        fetcher: () => Promise.resolve(MOCK_USERS),
        provider: () => new Map(),
      }}
    >
      <div className="space-y-4">
        <UserFilter value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">
          Filter is active - notice the highlighted border and background
        </p>
      </div>
    </SWRConfig>
  );
}

function SelectedUserFilter() {
  const [value, setValue] = useState<UserFilterValue>(2);

  return (
    <SWRConfig
      value={{
        fetcher: () => Promise.resolve(MOCK_USERS),
        provider: () => new Map(),
      }}
    >
      <div className="space-y-4">
        <UserFilter value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">
          A specific user is selected (Kari Hansen)
        </p>
      </div>
    </SWRConfig>
  );
}

function DeletedUserFilter() {
  const [value, setValue] = useState<UserFilterValue>(999);

  return (
    <SWRConfig
      value={{
        fetcher: () => Promise.resolve(MOCK_USERS),
        provider: () => new Map(),
      }}
    >
      <div className="space-y-4">
        <UserFilter value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">
          Selected user (id: 999) doesn&apos;t exist - will auto-reset to
          &quot;Mine&quot;
        </p>
      </div>
    </SWRConfig>
  );
}

export default {
  default: <InteractiveUserFilter />,
  loading: <LoadingUserFilter />,
  filteredState: <FilteredStateUserFilter />,
  selectedUser: <SelectedUserFilter />,
  deletedUser: <DeletedUserFilter />,
};
