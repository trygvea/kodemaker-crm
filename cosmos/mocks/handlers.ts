import { http, type HttpHandler, HttpResponse } from "msw";
import {
  type Comment,
  type Followup,
  getMockState,
  getNextId,
  resetMockState,
} from "./state";

type FollowupPayload = {
  note?: string;
  dueAt?: string;
  contactId?: number;
  companyId?: number;
  assignedToUserId?: number;
  completedAt?: string;
};

type CommentPayload = {
  content?: string;
  contactId?: number;
  companyId?: number;
};

function parseSearchParams(request: Request) {
  const url = new URL(request.url);
  return url.searchParams;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createFollowupFromBody(
  body: Partial<FollowupPayload>,
  partial?: Partial<Followup>,
): Followup {
  const now = new Date().toISOString();
  return {
    id: getNextId(),
    note: body.note ?? "Ny oppfølgning",
    dueAt: body.dueAt ?? now,
    createdAt: partial?.createdAt ?? now,
    createdBy: { firstName: "Cosmos", lastName: "Bruker" },
    contact: body.contactId
      ? { id: body.contactId, firstName: "Kari", lastName: "Nordmann" }
      : partial?.contact ?? null,
    company: body.companyId
      ? { id: body.companyId, name: "Kodemaker" }
      : partial?.company ?? null,
    assignedTo: body.assignedToUserId
      ? {
        id: body.assignedToUserId,
        firstName: "Tildelt",
        lastName: "Bruker",
      }
      : partial?.assignedTo ?? null,
    completedAt: partial?.completedAt ?? null,
    lead: partial?.lead ?? null,
  };
}

export const handlers: HttpHandler[] = [
  http.get("/api/followups", ({ request }) => {
    const params = parseSearchParams(request);
    const showCompleted = params.get("completed") === "1";
    const state = getMockState();
    if (showCompleted) {
      return HttpResponse.json(clone(state.completedFollowups));
    }
    return HttpResponse.json(clone(state.followups));
  }),

  http.post("/api/followups", async ({ request }) => {
    const state = getMockState();
    const body = (await request.json()) as Partial<FollowupPayload>;
    const newFollowup = createFollowupFromBody(body);
    state.followups.push(newFollowup);
    return HttpResponse.json(newFollowup, { status: 201 });
  }),

  http.patch("/api/followups/:id", async ({ params, request }) => {
    const state = getMockState();
    const body = (await request.json()) as Partial<FollowupPayload>;
    const id = Number(params.id);
    const match = state.followups.find((f) => f.id === id) ??
      state.completedFollowups.find((f) => f.id === id);
    if (!match) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const updated: Followup = {
      ...match,
      completedAt: body.completedAt ?? new Date().toISOString(),
    };
    state.followups = state.followups.filter((f) => f.id !== id);
    state.completedFollowups = [
      ...state.completedFollowups.filter((f) => f.id !== id),
      updated,
    ];
    return HttpResponse.json(updated);
  }),

  http.get("/api/comments", ({ request }) => {
    const params = parseSearchParams(request);
    const state = getMockState();
    const filtered = state.comments.filter((comment) => {
      if (params.get("contactId")) {
        return Boolean(comment.contact);
      }
      if (params.get("companyId")) {
        return Boolean(comment.company);
      }
      return true;
    });
    return HttpResponse.json(clone(filtered));
  }),

  http.post("/api/comments", async ({ request }) => {
    const body = (await request.json()) as Partial<CommentPayload>;
    const state = getMockState();
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: getNextId(),
      content: body.content ?? "Ny kommentar",
      createdAt: now,
      createdBy: { firstName: "Cosmos", lastName: "Bruker" },
      contact: body.contactId
        ? { id: body.contactId, firstName: "Kari", lastName: "Nordmann" }
        : null,
      company: body.companyId
        ? { id: body.companyId, name: "Kodemaker" }
        : null,
    };
    state.comments.push(newComment);
    return HttpResponse.json(newComment, { status: 201 });
  }),

  http.get("/api/emails", () => {
    const state = getMockState();
    return HttpResponse.json(clone(state.emails));
  }),

  http.get("/api/users", () => {
    const state = getMockState();
    return HttpResponse.json(clone(state.users));
  }),
];

export function resetHandlersState() {
  resetMockState();
}
