import React from "react";
import {
    CompanyHeader,
    ContactHeader,
    LeadHeader,
} from "@/components/entity-summary-header";

const contact = {
    id: 1,
    firstName: "Kolbjørn",
    lastName: "Haugen",
    phone: "12345678",
    linkedInUrl: "https://linkedin.com/in/kolbjorn",
    description: "Viktig notat om Kolbjørn og samarbeidet vårt.",
    createdAt: new Date().toISOString(),
    role: "CEO",
};

const contactEmails = [
    {
        id: 1,
        email: "kolbjorn.haugen@rema1000.no",
        active: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        email: "kolbjorn@example.com",
        active: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 3,
        email: "kolbjorn2@example.com",
        active: true,
        createdAt: new Date().toISOString(),
    },
];

const currentCompany = {
    id: 1,
    name: "Rema 1000",
    startDate: "2024-01-01",
    endDate: null,
};

const company = {
    id: 2,
    name: "Kodemaker",
    websiteUrl: "https://kodemaker.no",
    emailDomain: "kodemaker.no",
    contactEmail: "kontakt@kodemaker.no",
    description: "Konsulentselskap med fokus på kvalitet og faglig utvikling.",
    createdAt: new Date().toISOString(),
};

const leadCompany = { id: 3, name: "Stor Kunde AS" };
const leadContact = { id: 4, firstName: "Ola", lastName: "Nordmann" };

export default {
    contact: (
        <ContactHeader
            contact={contact}
            contactEmails={contactEmails}
            currentCompany={currentCompany}
            editHref="/contacts/1/edit"
        />
    ),
    company: <CompanyHeader company={company} editHref="/customers/2/edit" />,
    lead: <LeadHeader company={leadCompany} contact={leadContact} />,
};
