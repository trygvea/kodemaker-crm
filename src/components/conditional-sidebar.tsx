"use client";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export function ConditionalSidebar({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (!isAuthenticated || isLoginPage) {
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
