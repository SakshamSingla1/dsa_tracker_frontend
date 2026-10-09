import { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { Avatar } from "./ui/index.js";

export default function UserMenu({ user, onLogout, onViewProfile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg border border-line hover:border-line-strong transition-colors"
      >
        <Avatar name={user.displayName || user.email} size="sm" />
        <span className="hidden md:inline text-[13px] font-medium text-ink max-w-[120px] truncate">
          {user.displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-paper-raised border border-line rounded-lg shadow-lg py-1.5 z-40">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={user.displayName || user.email} size="lg" />
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-ink truncate">{user.displayName}</div>
              <div className="text-[12px] text-ink-soft truncate">{user.email}</div>
            </div>
          </div>
          <div className="h-px bg-line my-1" />
          {onViewProfile && (
            <button
              onClick={() => {
                setOpen(false);
                onViewProfile();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-ink hover:bg-ink/5 text-left"
            >
              <FiUser aria-hidden="true" /> View profile
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-hard hover:bg-hard-soft text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
