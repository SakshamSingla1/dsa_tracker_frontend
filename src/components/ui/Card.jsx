const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/** Flat, hairline-bordered card -- the base surface for every panel in the app. */
export default function Card({
  padding = "md",
  hoverable = false,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`bg-paper-raised border border-line rounded-lg
        ${hoverable ? "hover-lift hover:border-line-strong" : ""}
        ${PADDING[padding] ?? PADDING.md}
        ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
