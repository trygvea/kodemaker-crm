import { requireAuth } from "@/lib/require-auth";
import { CompanyDetailClient } from "./company-detail-client";

export default async function CompanyDetailPage() {
  await requireAuth();
  return <CompanyDetailClient />;
}
