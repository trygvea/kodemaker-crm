"use client"
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <div className="text-base text-muted-foreground">Du er nå logget ut</div>
      <Button
        className="text-lg py-6 px-8 bg-[#1a73e8] hover:bg-[#1765cc] text-white"
        onClick={() => signIn('google', { callbackUrl: '/' })}
      >
        Logg inn med din kodemaker.no konto
      </Button>
    </div>
  )
}


