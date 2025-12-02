import { CreateNewMenu } from "@/components/create-new-menu";

export default {
  default: <CreateNewMenu />,
  withContext: (
    <CreateNewMenu
      companyId={1}
      companyName="Kodemaker"
      contactId={5}
      contactName="Ola Nordmann"
    />
  ),
};


