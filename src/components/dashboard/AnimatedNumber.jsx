import { useCountUp } from "../../hooks/useCountUp.js";

export default function AnimatedNumber({ value, className = "mono" }) {
  const animated = useCountUp(value);
  return <span className={className}>{animated}</span>;
}
