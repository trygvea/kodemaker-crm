"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="flex flex-col items-center gap-6">
        <Button
          className="text-lg py-6 px-8"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Logg inn med din kodemaker.no konto
        </Button>
      </div>
    </div>
  );
}
