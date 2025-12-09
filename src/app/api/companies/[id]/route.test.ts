import { PATCH } from "./route";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({
  db: {
    update: vi.fn(() => ({
      set: () => ({ where: () => ({ returning: () => [[{ id: 1 }]] }) }),
    })),
  },
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
}));
vi.mock("@/db/schema", () => ({ companies: { id: "companies.id" } }));
vi.mock("drizzle-orm", () => ({ eq: (a: any, b: any) => [a, b] }));

describe("PATCH /api/companies/[id]", () => {
  it("treats empty strings as null for optional fields", async () => {
    const body = {
      name: "Acme",
      websiteUrl: "",
      emailDomain: "",
    };
    const req = {
      json: async () => body,
    };
    const res = await PATCH(
      req as any,
      { params: Promise.resolve({ id: "1" }) } as any,
    );
    expect(res.status).toBe(200);
  });
});
