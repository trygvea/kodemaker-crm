import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

vi.mock("swr", () => ({
  default: () => ({ data: undefined }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/customers",
}));

vi.mock("@/components/create-new-menu", () => ({
  CreateNewMenu: () => <button>Create New</button>,
}));

describe("Sidebar", () => {
  it("renders Create New button and not legacy Ny* actions", () => {
    render(<Sidebar />);

    expect(screen.getByText("Create New")).toBeDefined();
    expect(screen.queryByText("Ny organisasjon")).toBeNull();
    expect(screen.queryByText("Ny kontakt")).toBeNull();
    expect(screen.queryByText("Ny lead")).toBeNull();
  });
});


