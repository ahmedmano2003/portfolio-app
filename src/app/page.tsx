import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { prisma } from '@/lib/db';

export default async function HomePage() {
  const featured = await prisma.project.findMany({
    where: { isPublished: true, isFeatured: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, description: true, coverImage: true, tags: true },
  }).catch(() => []);

  return (
    <>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-3 mb-8 text-xs uppercase tracking-[0.3em] text-ink/60">
              <span className="w-12 h-px bg-ink/30" />
              <span>Est. 2019 — Cairo · Worldwide</span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight">
              An <span className="italic text-rust">independent</span> studio for
              <br />
              considered work.
            </h1>
          </div>
          <div className="md:col-span-4 md:pb-6">
            <p className="text-lg leading-relaxed text-ink/80 max-w-sm">
              We help ambitious teams design products, brands, and digital experiences that earn their place in the world.
            </p>
            <div className="flex gap-3 mt-6">
              <Link href="/projects" className="btn-primary">View work →</Link>
              <Link href="/contact" className="btn-secondary">Inquire</Link>
            </div>
          </div>
        </div>

        {/* المعلومات الإضافية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 border-t border-ink/10 pt-8">
          {[
            ['127', 'Projects delivered'],
            ['48', 'Clients worldwide'],
            ['9', 'Awards earned'],
            ['∞', 'Cups of coffee'],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="font-display text-5xl text-rust mb-1">{num}</div>
              <div className="text-xs uppercase tracking-widest text-ink/60">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="border-y border-ink/10 overflow-hidden bg-ink text-bone py-6">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 font-display text-3xl">
              <span>Brand identity</span>
              <span className="text-rust">✦</span>
              <span className="italic">Digital products</span>
              <span className="text-rust">✦</span>
              <span>Editorial design</span>
              <span className="text-rust">✦</span>
              <span className="italic">Art direction</span>
              <span className="text-rust">✦</span>
              <span>Strategy</span>
              <span className="text-rust">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED WORK ============ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ 01 — Selected Work</span>
            <h2 className="font-display text-5xl md:text-6xl mt-3">
              Recent <span className="italic">favourites</span>
            </h2>
          </div>
          <Link href="/projects" className="text-sm uppercase tracking-widest ink-link hidden md:inline">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-16 text-center text-ink/50">
            <p className="font-display italic text-2xl mb-2">Empty stage.</p>
            <p className="text-sm">Featured projects will appear here once added from the admin dashboard.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
            {featured.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                <div className="aspect-[4/5] bg-ink/5 overflow-hidden mb-4">
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-9xl text-ink/10">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display text-2xl group-hover:text-rust transition-colors">{p.title}</h3>
                  <span className="text-xs font-mono text-ink/50">{String(i + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}</span>
                </div>
                <p className="text-ink/70 mt-1 line-clamp-2">{p.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-ink text-bone py-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <span className="text-xs uppercase tracking-[0.3em] text-bone/60">§ 02 — The Studio</span>
          </div>
          <div className="md:col-span-8">
            <p className="font-display text-3xl md:text-4xl leading-[1.2] mb-8">
              We're a small team that <span className="italic text-rust">moves quickly</span>, makes thoughtful work, and refuses to ship anything we wouldn't be proud to sign.
            </p>
            <p className="text-bone/70 leading-relaxed max-w-2xl">
              Founded in 2019, Atelier partners with founders, cultural institutions, and brave brands to make digital things that feel inevitable. We're independent by design — small enough to care, experienced enough to deliver.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-8 text-rust ink-link uppercase tracking-widest text-sm">
              Start a project →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
