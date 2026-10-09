import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const FIELD_BASE = `w-full h-10 px-3 text-[13.5px] rounded-lg bg-white/[0.06] border border-white/10 text-white
  placeholder:text-white/35 transition-colors
  focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40 focus:border-[#8b5cf6]/50`;

export function DarkLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12.5px] font-medium text-white/70 mb-1.5">
      {children}
    </label>
  );
}

export function DarkInput({ className = "", ...rest }) {
  return <input className={`${FIELD_BASE} ${className}`} {...rest} />;
}

/** Plain-text/password toggle via a trailing eye icon -- the one small interaction detail
 *  worth carrying over from the reference design. */
export function PasswordField({ id, value, onChange, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <DarkInput
        id={id}
        type={visible ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
