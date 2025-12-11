import type { ApiComment, ApiEmail } from "@/types/api";

type Followup = {
  id: number;
  note: string;
  dueAt: string;
  completedAt?: string | null;
  createdAt: string;
  createdBy?: { firstName?: string | null; lastName?: string | null } | null;
  assignedTo?: { id: number; firstName: string; lastName: string } | null;
  company?: { id: number; name: string } | null;
  contact?:
    | { id: number; firstName: string | null; lastName: string | null }
    | null;
  lead?: { id: number; description: string } | null;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

type Comment = ApiComment & {
  contact?: { id: number; firstName: string; lastName: string } | null;
  company?: { id: number; name: string } | null;
};

type MockState = {
  followups: Followup[];
  completedFollowups: Followup[];
  comments: Comment[];
  emails: ApiEmail[];
  users: User[];
};

const initialFollowups: Followup[] = [
  {
    id: 1,
    note: "Følg opp tilbud sendt til Kodemaker.",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Ola", lastName: "Nordmann" },
    assignedTo: { id: 2, firstName: "Per", lastName: "Hansen" },
    company: { id: 1, name: "Kodemaker" },
    contact: { id: 5, firstName: "Kari", lastName: "Nordmann" },
  },
  {
    id: 2,
    note: "Ring kunden og avklar neste steg.",
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Per", lastName: "Hansen" },
    assignedTo: null,
  },
];

const initialCompletedFollowups: Followup[] = [
  {
    id: 3,
    note: "Fullført oppfølgning",
    dueAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Anne", lastName: "Larsen" },
    assignedTo: { id: 1, firstName: "Ola", lastName: "Nordmann" },
    contact: { id: 6, firstName: "Tom", lastName: "Berg" },
    company: { id: 2, name: "Acme Corp" },
  },
];

const initialComments: Comment[] = [
  {
    id: 1,
    content: "Dette er en kommentar om kontakten.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Ola", lastName: "Nordmann" },
    contact: { id: 5, firstName: "Kari", lastName: "Nordmann" },
  },
  {
    id: 2,
    content: "Viktig notat: Kunden er interessert i våre tjenester.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: { firstName: "Per", lastName: "Hansen" },
    company: { id: 1, name: "Kodemaker" },
  },
];

const initialEmails: ApiEmail[] = [
  {
    id: 1,
    subject: "Re: Prosjektforslag",
    content:
      "Hei,\n\nTakk for tilbudet. Vi vil gjerne diskutere dette videre.\n\nMvh,\nKari",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    subject: null,
    content: "Kort melding uten emne.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const initialUsers: User[] = [
  { id: 1, firstName: "Ola", lastName: "Nordmann" },
  { id: 2, firstName: "Per", lastName: "Hansen" },
  { id: 3, firstName: "Anne", lastName: "Larsen" },
];

export const INITIAL_MOCK_STATE: MockState = {
  followups: initialFollowups,
  completedFollowups: initialCompletedFollowups,
  comments: initialComments,
  emails: initialEmails,
  users: initialUsers,
};

let state: MockState = structuredClone(INITIAL_MOCK_STATE);

export function getMockState(): MockState {
  return state;
}

export function resetMockState() {
  state = structuredClone(INITIAL_MOCK_STATE);
}

export function getNextId() {
  const maxFollowupId = Math.max(
    ...state.followups.map((f) => f.id),
    ...state.completedFollowups.map((f) => f.id),
    0,
  );
  const maxCommentId = Math.max(...state.comments.map((c) => c.id), 0);
  const maxEmailId = Math.max(...state.emails.map((e) => e.id), 0);
  return Math.max(maxFollowupId, maxCommentId, maxEmailId) + 1;
}

export type { Comment, Followup, MockState, User };
