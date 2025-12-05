import { ContactCompaniesSection } from "@/components/contact-companies-section";

const previousCompanies = [
    {
        id: 2,
        name: "Tidligere Selskap AS",
        startDate: "2020-01-01",
        endDate: "2023-12-31",
    },
    {
        id: 3,
        name: "Gammelt Selskap",
        startDate: "2018-01-01",
        endDate: "2019-12-31",
    },
];

export default {
    withPrevious: (
        <ContactCompaniesSection previousCompanies={previousCompanies} />
    ),
    empty: <ContactCompaniesSection previousCompanies={[]} />,
};
