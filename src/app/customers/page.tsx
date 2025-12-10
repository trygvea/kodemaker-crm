import { requireAuth } from "@/lib/require-auth";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  await requireAuth();
  return <CustomersClient />;
}
