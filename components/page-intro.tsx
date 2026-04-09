export function PageIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      <p className="lead">{description}</p>
    </div>
  );
}
