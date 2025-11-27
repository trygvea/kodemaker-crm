import { createEvent } from "./events";
import { describe, expect, it, Mock, vi } from "vitest";

vi.mock("@/db/client", () => {
  return {
    db: {
      insert: vi.fn(() => ({
        values: () => ({
          returning: () => [{
            id: 1,
            entity: "contact",
            entityId: 2,
            description: "desc",
          }],
        }),
      })),
    },
    pool: { query: vi.fn(async () => ({ rows: [] })) },
  };
});

describe("createEvent", () => {
  it("inserts event and notifies listeners", async () => {
    const { pool } = await vi.importMock<any>("@/db/client");
    const res = await createEvent("contact" as any, 2, "desc");
    expect(res).toMatchObject({
      id: 1,
      entity: "contact",
      entityId: 2,
      description: "desc",
    });
    expect(pool.query).toHaveBeenCalled();
    const [sql, args] = (pool.query as Mock).mock.calls[0];
    expect(String(sql).toLowerCase()).toContain("pg_notify");
    expect(args[0]).toBe("events");
  });
});
