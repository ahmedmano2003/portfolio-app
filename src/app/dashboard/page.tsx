import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { paid?: string; order?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [orders, currentUser] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { project: { select: { title: true, slug: true, coverImage: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    }),
  ]);

  const purchased = orders.filter((o) => o.status === 'PAID');

  return (
    <>
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ Dashboard</span>
        <h1 className="font-display text-6xl mt-3">
          Hello, <span className="italic text-rust">{session.user.name?.split(' ')[0] || 'friend'}</span>.
        </h1>

        {searchParams.paid === '1' && (
          <div className="mt-8 bg-ink text-bone p-6">
            <p className="font-display text-2xl italic">Payment confirmed.</p>
            <p className="text-bone/70 text-sm mt-1">
              Your purchase has been recorded — check the library below.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-12 mb-16">
          <Stat label="Orders" value={orders.length} />
          <Stat label="Owned" value={purchased.length} />
          <Stat label="Member since" value={currentUser ? new Date(currentUser.createdAt).getFullYear() : '—'} small />
        </div>

        <h2 className="font-display text-3xl mb-6">Your library</h2>
        {purchased.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-12 text-center text-ink/50">
            <p className="font-display italic text-xl">Nothing purchased yet.</p>
            <Link href="/projects" className="inline-block mt-3 text-rust ink-link uppercase tracking-widest text-sm">
              Browse work →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
            {purchased.map((o) => (
              <li key={o.id} className="py-6 flex items-center justify-between gap-4">
                <div>
                  <Link href={`/projects/${o.project.slug}`} className="font-display text-xl ink-link">
                    {o.project.title}
                  </Link>
                  <p className="text-xs text-ink/50 mt-1 font-mono">
                    Order · {o.id.slice(0, 8)} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-rust font-mono">${(o.amount / 100).toFixed(0)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </>
  );
}

function Stat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="border border-ink/10 p-6">
      <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">{label}</div>
      <div className={`font-display ${small ? 'text-3xl' : 'text-5xl'} text-rust`}>{value}</div>
    </div>
  );
}
