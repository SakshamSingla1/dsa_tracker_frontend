function Block({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-ink/[0.06] ${className}`} />;
}

export default function SkeletonSheet() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-6 space-y-4">
        <Block className="h-5 w-40" />
        <Block className="h-9 w-72" />
        <Block className="h-9 w-full max-w-md" />

        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col gap-3 w-56 shrink-0 pt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Block key={i} className="h-10" />
            ))}
          </div>
          <div className="flex-1 min-w-0 space-y-3 pt-2">
            <Block className="h-6 w-48" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Block key={i} className="h-12" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
