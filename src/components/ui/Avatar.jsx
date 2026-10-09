import { initials } from "../profileIdentity.js";

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-[13px]",
  lg: "h-14 w-14 text-[18px]",
};

/** Flat initials avatar -- every user gets the same accent tone, keeping the UI's single-accent
 *  palette consistent rather than hashing a color per user. */
export default function Avatar({ name, size = "md", className = "" }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-accent-soft text-accent
        font-semibold shrink-0 ${SIZES[size] ?? SIZES.md} ${className}`}
    >
      {initials(name) || "?"}
    </div>
  );
}
