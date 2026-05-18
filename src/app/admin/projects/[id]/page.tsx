import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { EditProjectForm } from '@/components/EditProjectForm';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <>
      <Navbar />
      <section className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <Link href="/admin/projects" className="text-xs uppercase tracking-widest text-ink/60 ink-link">
          ← Back to projects
        </Link>
        <h1 className="font-display text-5xl mt-4 mb-10">
          Edit <span className="italic text-rust">{project.title}</span>
        </h1>
        <EditProjectForm project={project} />
      </section>
    </>
  );
}
