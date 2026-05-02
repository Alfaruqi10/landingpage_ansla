export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-panel p-8 text-center">
      <h3 className="text-3xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
