import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const [usersCount, projectsCount, ordersCount, paidSum, recentMessages, recentOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { email: true } }, project: { select: { title: true } } },
      }),
    ]);

  return (
    <>
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-rust">§ Admin · restricted</span>
            <h1 className="font-display text-6xl mt-3">Studio <span className="italic">control</span>.</h1>
          </div>
          <Link href="/admin/projects" className="btn-primary">Manage projects →</Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <KPI label="Users" value={usersCount} />
          <KPI label="Projects" value={projectsCount} />
          <KPI label="Orders" value={ordersCount} />
          <KPI label="Revenue" value={`$${((paidSum._sum.amount || 0) / 100).toFixed(0)}`} accent />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div>
            <h2 className="font-display text-2xl mb-4">Latest messages</h2>
            <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
              {recentMessages.length === 0 ? (
                <li className="py-6 text-ink/50 italic">No messages yet.</li>
              ) : (
                recentMessages.map((m) => (
                  <li key={m.id} className="py-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-ink/50 font-mono">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-ink/70 mt-1 line-clamp-1">{m.subject}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-4">Recent orders</h2>
            <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
              {recentOrders.length === 0 ? (
                <li className="py-6 text-ink/50 italic">No orders yet.</li>
              ) : (
                recentOrders.map((o) => (
                  <li key={o.id} className="py-4 flex justify-between items-baseline">
                    <div>
                      <p className="font-medium">{o.project.title}</p>
                      <p className="text-xs text-ink/50 mt-1">{o.user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-rust font-mono">${(o.amount / 100).toFixed(0)}</span>
                      <span className={`block text-xs mt-1 ${o.status === 'PAID' ? 'text-moss' : 'text-ink/50'}`}>
                        {o.status}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function KPI({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`p-6 border ${accent ? 'bg-ink text-bone border-ink' : 'border-ink/10'}`}>
      <div className={`text-xs uppercase tracking-widest mb-2 ${accent ? 'text-bone/60' : 'text-ink/50'}`}>{label}</div>
      <div className={`font-display text-5xl ${accent ? 'text-rust' : 'text-ink'}`}>{value}</div>
    </div>
  );
}
