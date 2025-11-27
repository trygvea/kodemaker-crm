import { render, screen } from "@testing-library/react";
import React from "react";
import CustomersPage from "./page";
import { describe, expect, it, vi } from "vitest";

vi.mock("swr", () => ({ default: () => ({ data: [] }) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe("CustomersPage", () => {
  it("renders heading and search field", () => {
    render(<CustomersPage />);
    expect(screen.getByText("Organisasjoner")).toBeDefined();
    expect(screen.getByPlaceholderText("Søk i organisasjoner"))
      .toBeDefined();
  });
});
