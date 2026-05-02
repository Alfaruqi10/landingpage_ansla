import { Reveal } from "@/components/shared/reveal";

export function PageHero({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section>
      <div className="container">
        <Reveal className="surface-panel overflow-hidden p-5 sm:p-8 lg:p-12">
          <p className="section-eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-balance text-3xl leading-[1.04] sm:mt-4 sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:mt-4 sm:max-w-2xl sm:text-lg">
            {description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
