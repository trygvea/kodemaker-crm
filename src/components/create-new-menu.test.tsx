import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { CreateNewMenu } from "./create-new-menu";

vi.mock("@/components/customers/new-company-dialog", () => ({
  NewCompanyDialog: () => null,
}));

vi.mock("@/components/customers/new-contact-dialog", () => ({
  NewContactDialog: () => null,
}));

vi.mock("@/components/customers/new-lead-dialog", () => ({
  NewLeadDialog: () => null,
}));

describe("CreateNewMenu", () => {
  it("renders trigger button with label", () => {
    render(<CreateNewMenu />);

    expect(screen.getByText("Create New")).toBeDefined();
  });

  it("shows dropdown items when opened", async () => {
    const user = userEvent.setup();
    render(<CreateNewMenu />);

    const triggerButton = screen.getByRole("button", { name: /Create New/ });
    await user.click(triggerButton);

    expect(await screen.findByText("Organisasjon")).toBeDefined();
    expect(await screen.findByText("Kontakt")).toBeDefined();
    expect(await screen.findByText("Lead")).toBeDefined();
  });
});
