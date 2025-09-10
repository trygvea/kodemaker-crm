"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSession, signOut, signIn } from 'next-auth/react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarSheetContent } from '@/components/sidebar'
import { Menu } from 'lucide-react'

export function AppHeader() {
  const { data: session } = useSession()
  const email = session?.user?.email || ''
  const avatarInitial = (email.trim()[0]?.toUpperCase() || '?') as string
  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded bg-white/15 hover:bg-white/25" aria-label="Open Menu"><Menu className="h-5 w-5" /></button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarSheetContent />
              </SheetContent>
            </Sheet>
          </div>
          <div className="relative h-8 w-8">
            <Image src="/next.svg" alt="Logo" fill className="invert drop-shadow" />
          </div>
          <Link href="/" className="font-semibold tracking-wide">Kodemaker CReMa</Link>
        </div>
        {session?.user ? (
          <nav className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Avatar>
                    <AvatarFallback className="bg-white/20 text-white font-semibold">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">{email}</TooltipContent>
            </Tooltip>
            <button
              type="button"
              className="rounded bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logg ut
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <button
              type="button"
              className="rounded bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              Logg inn
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}


