import { useState } from "react";
import { delay, http, HttpResponse } from "msw";
import {
  UserFilter,
  type UserFilterValue,
} from "@/components/filters/user-filter";
import { useFixtureHandlers } from "../../mocks/msw-worker";

function InteractiveUserFilter({
  initialValue = "mine",
}: {
  initialValue?: UserFilterValue;
}) {
  const [value, setValue] = useState<UserFilterValue>(initialValue);

  return (
    <div className="space-y-4">
      <UserFilter value={value} onChange={setValue} />
      <div className="text-sm text-muted-foreground">
        Current value:{" "}
        <code className="bg-muted px-1 py-0.5 rounded">
          {JSON.stringify(value)}
        </code>
      </div>
    </div>
  );
}

function LoadingUserFilter() {
  const [value, setValue] = useState<UserFilterValue>("mine");

  useFixtureHandlers([
    http.get("/api/users", async () => {
      await delay("infinite");
      return HttpResponse.json([]);
    }),
  ]);

  return <UserFilter value={value} onChange={setValue} />;
}

function FilteredStateUserFilter() {
  const [value, setValue] = useState<UserFilterValue>("all");

  return (
    <div className="space-y-4">
      <UserFilter value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Filter is active - notice the highlighted border and background
      </p>
    </div>
  );
}

function SelectedUserFilter() {
  const [value, setValue] = useState<UserFilterValue>(2);

  return (
    <div className="space-y-4">
      <UserFilter value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        A specific user is selected (Per Hansen)
      </p>
    </div>
  );
}

function DeletedUserFilter() {
  const [value, setValue] = useState<UserFilterValue>(999);

  return (
    <div className="space-y-4">
      <UserFilter value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Selected user (id: 999) doesn&apos;t exist - will auto-reset to
        &quot;Mine&quot;
      </p>
    </div>
  );
}

function ExcludeMineFilter() {
  const [value, setValue] = useState<UserFilterValue>("excludeMine");

  return (
    <div className="space-y-4">
      <UserFilter value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        &quot;Uten mine&quot; - shows all followups except those assigned to
        current user
      </p>
    </div>
  );
}

export default {
  default: <InteractiveUserFilter />,
  loading: <LoadingUserFilter />,
  filteredState: <FilteredStateUserFilter />,
  excludeMine: <ExcludeMineFilter />,
  selectedUser: <SelectedUserFilter />,
  deletedUser: <DeletedUserFilter />,
};
