import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { NewProjectForm } from '@/components/NewProjectForm';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <Link href="/admin" className="text-xs uppercase tracking-widest text-ink/60 ink-link">
          ← Admin
        </Link>

        <h1 className="font-display text-5xl mt-4 mb-12">
          Manage <span className="italic">projects</span>.
        </h1>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-2xl mb-6">New project</h2>
            <NewProjectForm />
          </div>

          <div className="md:col-span-7">
            <h2 className="font-display text-2xl mb-6">All projects ({projects.length})</h2>
            {projects.length === 0 ? (
              <p className="text-ink/50 italic">Nothing yet.</p>
            ) : (
              <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
                {projects.map((p) => (
                  <li key={p.id} className="py-4">
                    <div className="flex items-center gap-4">
                      {/* صورة مصغرة */}
                      <div className="w-16 h-16 bg-ink/5 flex-shrink-0 overflow-hidden">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/20 text-2xl font-display">
                            ?
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl truncate">{p.title}</h3>
                        <p className="text-xs text-ink/50 mt-0.5 font-mono">/{p.slug}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs flex-shrink-0">
                        {p.isFeatured && <span className="text-rust">✦</span>}
                        <span className={p.isPublished ? 'text-moss' : 'text-ink/40'}>
                          {p.isPublished ? '● Live' : '○ Draft'}
                        </span>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="btn-secondary !py-1 !px-3 !text-xs"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
