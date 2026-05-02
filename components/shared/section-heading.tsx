import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between", className)}
    >
      <div className="max-w-2xl">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-balance text-3xl leading-[1.06] sm:mt-3 sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm sm:mt-3 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
