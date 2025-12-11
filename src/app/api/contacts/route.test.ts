import { GET } from "./route";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// Mock auth to allow tests to run without a real session
vi.mock("@/lib/require-api-auth", () => ({
  requireApiAuth: vi.fn().mockResolvedValue({
    user: { id: "1", email: "test@kodemaker.no" },
  }),
}));

vi.mock("@/db/client", () => ({ db: {} }));
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
vi.mock("@/db/schema", () => ({
  contacts: {
    id: "contacts.id",
    firstName: "contacts.firstName",
    lastName: "contacts.lastName",
  },
  companies: { id: "companies.id", name: "companies.name" },
  contactCompanyHistory: {
    contactId: "cch.contactId",
    companyId: "cch.companyId",
    startDate: "cch.startDate",
    endDate: "cch.endDate",
  },
  contactEmails: {
    id: "contact_emails.id",
    contactId: "contact_emails.contactId",
    email: "contact_emails.email",
    active: "contact_emails.active",
    createdAt: "contact_emails.createdAt",
  },
}));
vi.mock("drizzle-orm", () => ({
  asc: (x: any) => x,
  eq: (a: any, b: any) => [a, b],
  ilike: (a: any, b: any) => [a, b],
  or: (...args: any[]) => args,
  isNull: (x: any) => x,
  and: (...args: any[]) => args,
  inArray: (a: any, b: any) => [a, b],
}));

// Lightweight fake builder to simulate .select().from().leftJoin()....limit()
class FakeQuery {
  private rows: any[];
  constructor(rows: any[]) {
    this.rows = rows;
  }
  select() {
    return this;
  }
  from() {
    return this;
  }
  leftJoin() {
    return this;
  }
  where() {
    return this;
  }
  orderBy() {
    return this;
  }
  limit() {
    return Promise.resolve(this.rows);
  }
  then(onFulfilled: (value: any) => any, onRejected?: (reason: any) => any) {
    return Promise.resolve(this.rows).then(onFulfilled, onRejected);
  }
}

describe("GET /api/contacts de-dup", () => {
  it("deduplicates contacts by id in default list", async () => {
    const { db } = await vi.importMock<any>("@/db/client");
    db.select = vi.fn(
      () =>
        new FakeQuery([
          {
            id: 1,
            firstName: "A",
            lastName: "B",
            company: { id: 11, name: "X" },
          },
          {
            id: 1,
            firstName: "A",
            lastName: "B",
            company: { id: 12, name: "Y" },
          },
          { id: 2, firstName: "C", lastName: "D", company: null },
        ]),
    );
    const req = { url: "https://x.local/api/contacts" };
    const res = await GET(req as any);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body.map((r: any) => r.id)).toEqual([1, 2]);
  });
});
