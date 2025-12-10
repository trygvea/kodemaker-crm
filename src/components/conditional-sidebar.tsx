"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export function ConditionalSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;
  const isLoginPage = pathname === "/login";

  if (!isLoggedIn || isLoginPage) {
    return (
      <div className="mx-auto max-w-6xl flex">
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
