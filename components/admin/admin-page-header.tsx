export function AdminPageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl">{description}</p>
    </div>
  );
}
