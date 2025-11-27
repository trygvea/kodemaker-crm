import { POST } from "./route";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database and dependencies
vi.mock("@/db/client", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
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

vi.mock("@/db/events", () => ({
  createEventWithContext: vi.fn(),
}));

const { db } = await vi.importMock<any>("@/db/client");
const { createEventWithContext } = await vi.importMock<any>("@/db/events");

describe("/api/contacts/[id]/merge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate merge request schema", async () => {
    const params = Promise.resolve({ id: "1" });
    const req = {
      json: vi.fn().mockResolvedValue({
        targetContactId: "invalid", // Should be number
      }),
    };

    const response = await POST(req as any, { params });
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("should return 404 if source contact not found", async () => {
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // No contact found
        }),
      }),
    });

    const params = Promise.resolve({ id: "999" });
    const req = {
      json: vi.fn().mockResolvedValue({
        targetContactId: 2,
        mergeEmailAddresses: true,
        deleteSourceContact: false,
      }),
    };

    const response = await POST(req as any, { params });
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Source contact not found");
  });

  it("should prevent merging contact with itself", async () => {
    // Mock contacts exist
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValueOnce([{
              id: 1,
              firstName: "John",
              lastName: "Doe",
            }])
            .mockResolvedValueOnce([{
              id: 1,
              firstName: "John",
              lastName: "Doe",
            }]),
        }),
      }),
    });

    const params = Promise.resolve({ id: "1" });
    const req = {
      json: vi.fn().mockResolvedValue({
        targetContactId: 1, // Same as source
        mergeEmailAddresses: true,
        deleteSourceContact: false,
      }),
    };

    const response = await POST(req as any, { params });
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Cannot merge contact with itself");
  });

  it("should successfully merge contacts", async () => {
    // Mock transaction
    const mockTransaction = vi.fn().mockImplementation(async (callback) => {
      await callback({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn(),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn(),
        }),
      });
    });

    db.transaction = mockTransaction;

    // Mock contacts exist and are different
    let callCount = 0;
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{
                id: 1,
                firstName: "John",
                lastName: "Doe",
              }]);
            } else {
              return Promise.resolve([{
                id: 2,
                firstName: "Jane",
                lastName: "Smith",
              }]);
            }
          }),
        }),
      }),
    });

    const params = Promise.resolve({ id: "1" });
    const req = {
      json: vi.fn().mockResolvedValue({
        targetContactId: 2,
        mergeEmailAddresses: true,
        mergeEmails: false,
        mergeLeads: false,
        mergeComments: false,
        mergeEvents: false,
        mergeFollowups: false,
        deleteSourceContact: false,
      }),
    };

    const response = await POST(req as any, { params });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Successfully merged");

    // Verify transaction was called
    expect(mockTransaction).toHaveBeenCalled();

    // Verify event was created
    expect(createEventWithContext).toHaveBeenCalledWith(
      "contact",
      2,
      "Merge",
      expect.objectContaining({
        contactId: 2,
        excerpt: expect.stringContaining("Merged contact John Doe"),
      }),
    );
  });

  it("should successfully merge comments when requested", async () => {
    // Mock transaction that tracks what gets merged
    const mockUpdateCalls: any[] = [];
    const mockTransaction = vi.fn().mockImplementation(async (callback) => {
      await callback({
        update: vi.fn().mockImplementation((table) => {
          const updateCall = { table };
          mockUpdateCalls.push(updateCall);
          return {
            set: vi.fn().mockReturnValue({
              where: vi.fn(),
            }),
          };
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn(),
        }),
      });
    });

    db.transaction = mockTransaction;

    // Mock contacts exist and are different
    let callCount = 0;
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([{
                id: 1,
                firstName: "John",
                lastName: "Doe",
              }]);
            } else {
              return Promise.resolve([{
                id: 2,
                firstName: "Jane",
                lastName: "Smith",
              }]);
            }
          }),
        }),
      }),
    });

    const params = Promise.resolve({ id: "1" });
    const req = {
      json: vi.fn().mockResolvedValue({
        targetContactId: 2,
        mergeEmailAddresses: false,
        mergeEmails: false,
        mergeLeads: false,
        mergeComments: true, // Only merge comments
        mergeEvents: false,
        mergeFollowups: false,
        deleteSourceContact: false,
      }),
    };

    const response = await POST(req as any, { params });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Successfully merged");

    // Verify transaction was called
    expect(mockTransaction).toHaveBeenCalled();

    // Should have called update once for comments
    expect(mockUpdateCalls).toHaveLength(1);
  });
});
