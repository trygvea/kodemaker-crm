import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SWRConfig } from "swr";
import { UserFilter, type UserFilterValue, type UserData } from "./user-filter";

const MOCK_USERS: UserData[] = [
  { id: 1, firstName: "Ola", lastName: "Nordmann" },
  { id: 2, firstName: "Kari", lastName: "Hansen" },
  { id: 3, firstName: "Per", lastName: "Olsen" },
];

function renderWithSWR(
  ui: React.ReactElement,
  options?: { users?: UserData[] | null; delay?: number }
) {
  const { users = MOCK_USERS, delay = 0 } = options ?? {};

  return render(
    <SWRConfig
      value={{
        fetcher: () => {
          if (delay > 0) {
            return new Promise((resolve) => setTimeout(() => resolve(users), delay));
          }
          return Promise.resolve(users);
        },
        provider: () => new Map(),
        dedupingInterval: 0,
      }}
    >
      {ui}
    </SWRConfig>
  );
}

describe("UserFilter", () => {
  it("renders with default 'Mine' value", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
    expect(screen.getByText("Mine")).toBeInTheDocument();
  });

  it("renders with 'Alle' value and shows Users icon", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="all" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Alle")).toBeInTheDocument();
    });
  });

  it("renders with 'excludeMine' value and shows 'Uten mine'", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="excludeMine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Uten mine")).toBeInTheDocument();
    });
  });

  it("renders selected user name when value is a user id", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value={1} onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    });
  });

  it("shows dropdown with options when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Søk bruker...")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Mine").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Alle").length).toBeGreaterThanOrEqual(1);
  });

  it("shows users list in dropdown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
      expect(screen.getByText("Kari Hansen")).toBeInTheDocument();
      expect(screen.getByText("Per Olsen")).toBeInTheDocument();
    });
  });

  it("calls onChange with 'all' when Alle is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Brukere")).toBeInTheDocument();
    });

    // Find the "Alle" option in the dropdown (not the trigger button text)
    const alleOptions = screen.getAllByText("Alle");
    const alleOption = alleOptions.find((el) => el.closest('[data-slot="command-item"]') !== null);
    await user.click(alleOption!);

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("calls onChange with user id when a user is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Kari Hansen")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Kari Hansen"));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("filters users based on search query", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Søk bruker...");
    await user.type(searchInput, "Kari");

    await waitFor(() => {
      expect(screen.getByText("Kari Hansen")).toBeInTheDocument();
      expect(screen.queryByText("Ola Nordmann")).not.toBeInTheDocument();
      expect(screen.queryByText("Per Olsen")).not.toBeInTheDocument();
    });
  });

  it("shows visual feedback when filter is active (not 'mine')", async () => {
    const onChange = vi.fn();
    let rerender: ReturnType<typeof renderWithSWR>["rerender"];
    await act(async () => {
      const result = renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
      rerender = result.rerender;
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");

    // Default state - no active filter styling
    expect(trigger).not.toHaveClass("border-primary/50");

    // Re-render with "all" filter
    await act(async () => {
      rerender!(
        <SWRConfig
          value={{
            fetcher: () => Promise.resolve(MOCK_USERS),
            provider: () => new Map(),
          }}
        >
          <UserFilter value="all" onChange={onChange} />
        </SWRConfig>
      );
    });

    // Should have active filter styling
    await waitFor(() => {
      expect(trigger).toHaveClass("border-primary/50");
      expect(trigger).toHaveClass("bg-primary/5");
    });
  });

  it("resets to 'mine' when selected user no longer exists", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value={999} onChange={onChange} />, {
        users: MOCK_USERS,
      });
    });

    // Wait for effect to run and detect non-existent user
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("mine");
    });
  });

  it("shows loading state while fetching users", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value={1} onChange={onChange} />, {
        delay: 1000,
      });
    });

    // Should show loading text while users are being fetched
    await waitFor(() => {
      expect(screen.getByText("Laster...")).toBeInTheDocument();
    });
  });

  it("has correct accessibility attributes", async () => {
    const onChange = vi.fn();
    await act(async () => {
      renderWithSWR(<UserFilter value="mine" onChange={onChange} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-label", "Filter: Mine");
  });
});
