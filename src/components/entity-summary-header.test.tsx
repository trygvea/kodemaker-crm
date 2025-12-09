import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    CompanyHeader,
    ContactHeader,
    EntitySummaryHeader,
    LeadHeader,
} from "./entity-summary-header";

describe("EntitySummaryHeader", () => {
    it("renders title and items", () => {
        render(
            <EntitySummaryHeader
                title="Tittel"
                items={[
                    {
                        label: "Felt",
                        icon: <span>*</span>,
                        content: <span>Innhold</span>,
                    },
                ]}
            />,
        );

        expect(screen.getByText("Tittel")).toBeDefined();
        expect(screen.getByText("Innhold")).toBeDefined();
    });
});

describe("ContactHeader", () => {
    const baseContact = {
        id: 1,
        firstName: "Kolbjørn",
        lastName: "Haugen",
        phone: "12345678",
        linkedInUrl: "https://linkedin.com/in/test",
        description: "Viktig notat",
        createdAt: new Date().toISOString(),
    };

    const baseEmails = [
        {
            id: 1,
            email: "kolbjorn@example.com",
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            email: "second@example.com",
            active: true,
            createdAt: new Date().toISOString(),
        },
    ];

    const currentCompany = {
        id: 1,
        name: "Rema 1000",
        startDate: null,
        endDate: null,
        role: "CEO",
    };

    it("renders contact info with edit button and role", () => {
        render(
            <ContactHeader
                contact={baseContact}
                contactEmails={baseEmails}
                currentCompany={currentCompany}
                editHref="/contacts/1/edit"
            />,
        );

        expect(screen.getByText("Kolbjørn Haugen")).toBeDefined();
        expect(
            screen.getByRole("link", { name: "Endre" }).getAttribute("href"),
        ).toBe("/contacts/1/edit");
        expect(
            screen.getByText("kolbjorn@example.com", { exact: false }),
        ).toBeDefined();
        expect(
            screen.getByText("second@example.com", { exact: false }),
        ).toBeDefined();
        expect(screen.getByText("LinkedIn")).toBeDefined();
        expect(screen.getByText("12345678")).toBeDefined();
        expect(screen.getByText("Rema 1000")).toBeDefined();
        expect(screen.getByText("CEO")).toBeDefined();
        expect(screen.getByText("Viktig notat")).toBeDefined();
    });
});

describe("CompanyHeader", () => {
    const company = {
        id: 1,
        name: "Kodemaker",
        websiteUrl: "https://kodemaker.no",
        emailDomain: "kodemaker.no",
        description: "Konsulentselskap",
        createdAt: new Date().toISOString(),
    };

    it("renders company info with edit button", () => {
        render(
            <CompanyHeader company={company} editHref="/customers/1/edit" />,
        );

        expect(screen.getByText("Kodemaker")).toBeDefined();
        expect(
            screen.getByRole("link", { name: "Endre" }).getAttribute("href"),
        ).toBe("/customers/1/edit");
        expect(screen.getByText("https://kodemaker.no")).toBeDefined();
        expect(screen.getByText("kodemaker.no")).toBeDefined();
        expect(screen.getByText("Konsulentselskap")).toBeDefined();
    });
});

describe("LeadHeader", () => {
    it("renders contact and organisation when provided", () => {
        render(
            <LeadHeader
                contact={{ id: 2, firstName: "Ola", lastName: "Nordmann" }}
                company={{ id: 3, name: "Bedrift AS" }}
            />,
        );

        expect(screen.getByText("Lead")).toBeDefined();
        expect(
            screen
                .getByRole("link", {
                    name: "Ola Nordmann",
                })
                .getAttribute("href"),
        ).toBe("/contacts/2");
        expect(
            screen
                .getByRole("link", {
                    name: "Bedrift AS",
                })
                .getAttribute("href"),
        ).toBe("/customers/3");
    });

    it("renders only title when no company or contact", () => {
        render(<LeadHeader contact={null} company={null} />);

        expect(screen.getByText("Lead")).toBeDefined();
    });
});
