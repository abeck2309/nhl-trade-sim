import { Container } from "@/components/container";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5">
      <Container className="flex flex-col gap-3 py-8 text-sm text-mist md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p>NHL Trade Simulator</p>
          <p className="text-xs text-mist/80">
            © {new Date().getFullYear()} Golden Edge Analytics. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-xs tracking-[0.16em] text-slate-300">
          <Link
            href="https://goldenedgeanalytics.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Hub
          </Link>
          <Link
            href="https://goldenedgeanalytics-traderoi.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Projects
          </Link>
          <Link
            href="https://goldenedgeanalytics.vercel.app/articles"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Articles
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
