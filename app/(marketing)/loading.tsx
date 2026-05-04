export default function MarketingLoading() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="animate-pulse space-y-8">
        <div className="surface-panel overflow-hidden p-6 sm:p-8">
          <div className="h-4 w-32 rounded-full bg-stone-200" />
          <div className="mt-4 h-12 max-w-2xl rounded-2xl bg-stone-200" />
          <div className="mt-4 h-4 max-w-3xl rounded-full bg-stone-100" />
          <div className="mt-2 h-4 max-w-2xl rounded-full bg-stone-100" />
          <div className="mt-6 flex gap-3">
            <div className="h-11 w-40 rounded-full bg-stone-200" />
            <div className="h-11 w-44 rounded-full bg-stone-100" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-panel overflow-hidden p-3">
              <div className="aspect-[4/5] rounded-[1.25rem] bg-stone-200" />
              <div className="p-4">
                <div className="h-4 w-24 rounded-full bg-stone-100" />
                <div className="mt-4 h-6 w-3/4 rounded-full bg-stone-200" />
                <div className="mt-3 h-4 w-full rounded-full bg-stone-100" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-stone-100" />
                <div className="mt-6 h-7 w-28 rounded-full bg-stone-200" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-10 rounded-full bg-stone-200" />
                  <div className="h-10 rounded-full bg-stone-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
