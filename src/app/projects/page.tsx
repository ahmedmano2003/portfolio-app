import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  }).catch(() => []);

  return (
    <>
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ Index 01 — Selected Work</span>
        <h1 className="font-display text-7xl md:text-8xl mt-4">
          The <span className="italic text-rust">work</span>.
        </h1>
        <p className="mt-6 max-w-xl text-ink/70 text-lg">
          A complete index of public projects. Filter by discipline, or scroll through everything.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-32">
        {projects.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-16 text-center text-ink/50">
            <p className="font-display italic text-2xl mb-2">No projects yet.</p>
            <p className="text-sm">Check back soon — or contact us about an unpublished commission.</p>
          </div>
        ) : (
          <ul className="border-t border-ink/10">
            {projects.map((p, i) => (
              <li key={p.id} className="border-b border-ink/10 group">
                <Link href={`/projects/${p.slug}`} className="block py-8 hover:bg-ink/[0.02] transition-colors -mx-6 px-6">
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-1 text-xs font-mono text-ink/40">
                      {String(i + 1).padStart(3, '0')}
                    </div>
                    <div className="md:col-span-5">
                      <h2 className="font-display text-3xl md:text-4xl group-hover:text-rust transition-colors">
                        {p.title}
                        {p.isFeatured && <span className="ml-2 text-rust text-xs align-top">✦</span>}
                      </h2>
                    </div>
                    <div className="md:col-span-4">
                      <p className="text-ink/70 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="md:col-span-2 text-right">
                      {p.price && p.price > 0 ? (
                        <span className="text-rust font-mono">${(p.price / 100).toFixed(0)}</span>
                      ) : (
                        <span className="text-xs uppercase tracking-widest text-ink/40">Case study</span>
                      )}
                      <span className="block text-xs text-ink/40 mt-1">→ view</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </>
  );
}
