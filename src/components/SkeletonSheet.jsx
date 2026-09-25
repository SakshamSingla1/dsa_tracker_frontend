export default function SkeletonSheet() {
  return (
    <div className="app-shell">
      <div className="skeleton-block skeleton-eyebrow" />
      <div className="skeleton-block skeleton-title" />
      <div className="skeleton-block skeleton-lede" />
      <div className="skeleton-block skeleton-tabs" />
      <div className="skeleton-block skeleton-controls" />
      <div className="layout">
        <div className="skeleton-sidebar">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton-block skeleton-sidebar-item" />
          ))}
        </div>
        <div className="skeleton-content">
          <div className="skeleton-block skeleton-heading" />
          <div className="skeleton-rows">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-block skeleton-row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
