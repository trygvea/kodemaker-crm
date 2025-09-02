import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Du må logge inn med Google</h1>
      <Link className="underline" href="/api/auth/signin">Logg inn</Link>
    </div>
  )
}


