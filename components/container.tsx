import { cn } from "@/lib/cn";

export function Container({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-8", className)}>{children}</div>;
}
