import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-ink/10 bg-bone/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-tight">
          <span className="italic">Atelier</span>
          <span className="text-rust">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-sm uppercase tracking-widest">
          <Link href="/projects" className="ink-link">Work</Link>
          <Link href="/#about" className="ink-link">Studio</Link>
          <Link href="/contact" className="ink-link">Contact</Link>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-rust ink-link">Admin</Link>
              )}
              <Link href="/dashboard" className="ink-link">Dashboard</Link>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button type="submit" className="text-ink/70 hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="ink-link">Login</Link>
              <Link href="/register" className="btn-primary !py-2 !px-4 text-xs">Join</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
