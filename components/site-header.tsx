"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#090c10]/88 backdrop-blur-xl">
      <Container className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-4 rounded-md" aria-label="NHL Trade Simulator home">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <Image
              src="/nhl-logo.png"
              alt="NHL logo"
              width={34}
              height={34}
              className="h-auto w-[34px] object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.08em] text-white">
              NHL Trade Simulator
            </p>
            <p className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.22em] text-slate-300">
              Vegas Trade And Lineup Lab
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap gap-2">
          {siteConfig.navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : false;
            const navClass = cn(
              "rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-mist hover:border-white/15 hover:text-white",
              isActive && "border-white/20 bg-white/[0.08] text-white"
            );

            if (item.href.startsWith("#")) {
              return (
                <a key={item.href} href={item.href} className={navClass}>
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={navClass}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
