const VARIANTS = {
  primary: "bg-accent text-accent-ink border-transparent hover:brightness-110 disabled:opacity-50",
  secondary: "bg-paper-raised text-ink border-line hover:border-line-strong disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft border-transparent hover:bg-ink/5 hover:text-ink disabled:opacity-50",
  danger: "bg-hard text-white border-transparent hover:brightness-110 disabled:opacity-50",
};

const SIZES = {
  sm: "h-8 px-2.5 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
};

/** Shared button primitive -- every screen should use this instead of a raw <button> so
 *  variant/size/focus/disabled styling stays consistent across the app. */
export default function Button({
  variant = "secondary",
  size = "md",
  icon = null,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg border font-medium
        whitespace-nowrap transition-colors cursor-pointer
        disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.secondary}
        ${SIZES[size] ?? SIZES.md}
        ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0 flex items-center">{icon}</span>
      )}
      {children && <span className={loading ? "opacity-70" : ""}>{children}</span>}
      {!loading && icon && iconPosition === "right" && <span className="shrink-0 flex items-center">{icon}</span>}
    </button>
  );
}
