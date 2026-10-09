/** Shared shell for the auth screen -- deliberately always-dark/glass regardless of the
 *  app's own light/dark theme toggle (matches the dark reference design this was ported
 *  from): a desktop split-screen (branding panel + glass card), single centered card on
 *  mobile. Mirrors admin-frontend/src/auth/AuthLayout.jsx so both apps' auth screens match. */
export default function AuthLayout({ featureTitle, features, children }) {
  return (
    <div
      className="min-h-screen w-full flex relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 30% 20%, #1e293b 0%, #020617 60%)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(139, 92, 246, 0.28)", animationDuration: "7s" }}
        />
        <span
          className="absolute top-1/3 -right-20 h-80 w-80 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(192, 38, 211, 0.22)", animationDuration: "9s", animationDelay: "1.5s" }}
        />
        <span
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(34, 211, 238, 0.18)", animationDuration: "8s", animationDelay: "0.5s" }}
        />
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-center p-12 relative z-10 max-w-xl">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="h-9 w-9 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center text-[14px] font-bold">
            {"</>"}
          </span>
          <span className="text-white font-semibold text-[15px]">DSA Problem Tracker</span>
        </div>

        <h1 className="text-white text-3xl font-semibold leading-tight mb-4">{featureTitle}</h1>
        <ul className="space-y-3 mt-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-white/70 text-[14px] leading-snug">
              <span className="h-5 w-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-[#c4b5fd]">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div
          className="w-full max-w-md rounded-2xl border border-white/10 p-8 animate-fade-up"
          style={{ background: "rgba(12, 16, 32, 0.96)", backdropFilter: "blur(28px)", boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <span className="h-8 w-8 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center text-[13px] font-bold">
              {"</>"}
            </span>
            <span className="text-white font-semibold text-[14px]">DSA Problem Tracker</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
