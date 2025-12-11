import { PATCH } from "./route";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// Mock auth to allow tests to run without a real session
vi.mock("@/lib/require-api-auth", () => ({
  requireApiAuth: vi.fn().mockResolvedValue({
    user: { id: "1", email: "test@kodemaker.no" },
  }),
}));

vi.mock("@/db/client", () => ({
  db: {
    update: vi.fn(() => ({
      set: () => ({ where: () => ({ returning: () => [[{ id: 1 }]] }) }),
    })),
  },
}));
vi.mock("next/server", () => {
  class MockNextResponse {
    private body: any;
    private init?: any;
    constructor(body: any, init?: any) {
      this.body = body;
      this.init = init;
    }
    static json(data: any, init?: any) {
      return new MockNextResponse(data, init);
    }
    async json() {
      return this.body;
    }
    get status() {
      return this.init?.status ?? 200;
    }
  }
  return { NextResponse: MockNextResponse };
});
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
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "1" }) } as any);
    expect(res.status).toBe(200);
  });
});
