import { ActivityLog } from "@/components/activity-log";
import { SWRConfig } from "swr";
import type { ApiComment, ApiEmail } from "@/types/api";

const mockOpenFollowups = [
    {
        id: 1,
        note: "Følg opp tilbud sendt til Kodemaker.",
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { firstName: "Ola", lastName: "Nordmann" },
        company: { id: 1, name: "Kodemaker" },
        contact: { id: 5, firstName: "Kari", lastName: "Nordmann" },
    },
    {
        id: 2,
        note: "Ring kunden og avklar neste steg.",
        dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { firstName: "Per", lastName: "Hansen" },
    },
];

const mockCompletedFollowups = [
    {
        id: 3,
        note: "Fullført oppfølgning",
        dueAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            .toISOString(),
        createdBy: { firstName: "Anne", lastName: "Larsen" },
        contact: { id: 6, firstName: "Tom", lastName: "Berg" },
    },
];

const mockComments: ApiComment[] = [
    {
        id: 1,
        content: "Dette er en kommentar om kontakten.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        content: "Viktig notat: Kunden er interessert i våre tjenester.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const mockEmails: ApiEmail[] = [
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

function MockActivityLog() {
    return (
        <SWRConfig
            value={{
                fetcher: (url: string) => {
                    if (
                        url.includes("/api/followups") &&
                        url.includes("completed=1")
                    ) {
                        return Promise.resolve(mockCompletedFollowups);
                    }
                    if (url.includes("/api/followups")) {
                        return Promise.resolve(mockOpenFollowups);
                    }
                    if (url.includes("/api/comments")) {
                        return Promise.resolve(mockComments);
                    }
                    if (url.includes("/api/emails")) {
                        return Promise.resolve(mockEmails);
                    }
                    return Promise.resolve(null);
                },
            }}
        >
            <ActivityLog
                contactId={1}
                companyId={1}
                initialEmails={mockEmails}
            />
        </SWRConfig>
    );
}

function EmptyActivityLog() {
    return (
        <SWRConfig
            value={{
                fetcher: () => Promise.resolve([]),
            }}
        >
            <ActivityLog contactId={1} />
        </SWRConfig>
    );
}

export default {
    default: <MockActivityLog />,
    empty: <EmptyActivityLog />,
};
