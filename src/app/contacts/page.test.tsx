import { fireEvent, render, screen } from "@testing-library/react";
import { ContactsClient } from "./contacts-client";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSWR = vi.fn();
vi.mock("swr", () => ({ default: (key: any) => mockUseSWR(key) }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("ContactsSearchPage navigation", () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
  });

  it("navigates to contact on row click and preserves inner company link", () => {
    mockUseSWR.mockReturnValue({
      data: [
        {
          id: 10,
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@x",
          company: { id: 7, name: "Acme" },
        },
      ],
    });

    render(<ContactsClient />);
    const row = screen.getByText("Jane Doe").closest('div[role="button"]')!;
    fireEvent.click(row);
    expect(push).toHaveBeenCalledWith("/contacts/10");

    // Company anchor should navigate only its own href and not trigger row navigation
    push.mockReset();
    const companyLink = screen.getByText("Acme") as HTMLAnchorElement;
    companyLink.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(companyLink);
    expect(companyLink.getAttribute("href")).toBe("/customers/7");
    expect(push).not.toHaveBeenCalled();
  });
});
