import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BuyButton } from '@/components/BuyButton';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug, isPublished: true },
  });

  if (!project) notFound();

  const session = await auth();

  let alreadyOwned = false;
  if (session?.user) {
    const order = await prisma.order.findFirst({
      where: { userId: session.user.id, projectId: project.id, status: 'PAID' },
    });
    alreadyOwned = !!order;
  }

  return (
    <>
      <Navbar />

      <article className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <Link href="/projects" className="text-xs uppercase tracking-widest text-ink/60 ink-link">
          ← All work
        </Link>

        <header className="mt-8 pb-12 border-b border-ink/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((t) => (
              <span key={t} className="text-xs uppercase tracking-widest text-rust border border-rust/30 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-6xl md:text-7xl leading-tight">{project.title}</h1>
          <p className="mt-6 text-xl text-ink/70 max-w-2xl">{project.description}</p>
        </header>

        {project.coverImage && (
          <div className="aspect-[16/9] my-12 bg-ink/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none font-display"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />

        {project.price && project.price > 0 && (
          <div className="mt-16 p-8 bg-ink text-bone flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-bone/60">§ Purchase</span>
              <h3 className="font-display text-3xl mt-2">
                Get the full <span className="italic">case study</span>
              </h3>
              <p className="text-bone/70 mt-2">Includes source files, process notes, and a 1-hour consultation.</p>
            </div>
            <div className="text-right">
              <div className="font-display text-5xl text-rust mb-3">${(project.price / 100).toFixed(0)}</div>
              {alreadyOwned ? (
                <span className="text-bone/60 text-sm">✓ You own this</span>
              ) : (
                <BuyButton projectId={project.id} loggedIn={!!session?.user} />
              )}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </>
  );
}
