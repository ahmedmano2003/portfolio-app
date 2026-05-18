import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl mb-3">
            <span className="italic">Atelier</span>
            <span className="text-rust">.</span>
          </h3>
          <p className="text-ink/70 max-w-sm leading-relaxed">
            An independent studio for design, strategy, and the things in between. Open for collaboration worldwide.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink/50 mb-4">Navigate</h4>
          <ul className="space-y-2">
            <li><Link href="/projects" className="ink-link">Work</Link></li>
            <li><Link href="/contact" className="ink-link">Contact</Link></li>
            <li><Link href="/login" className="ink-link">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink/50 mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="#" className="ink-link">Privacy</Link></li>
            <li><Link href="#" className="ink-link">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-ink/50">
          <p>© {new Date().getFullYear()} Atelier. All rights reserved.</p>
          <p className="font-mono">v1.0.0 — built with care</p>
        </div>
      </div>
    </footer>
  );
}
