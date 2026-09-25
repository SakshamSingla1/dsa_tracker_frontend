import { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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
    <div className="user-menu" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="user-avatar">{initials(user.displayName || user.email)}</span>
        <span className="user-menu-name">{user.displayName}</span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <span className="user-avatar user-avatar-lg">{initials(user.displayName || user.email)}</span>
            <div className="user-menu-identity">
              <div className="user-menu-display-name">{user.displayName}</div>
              <div className="user-menu-email">{user.email}</div>
            </div>
          </div>
          <div className="user-menu-divider" />
          {onViewProfile && (
            <button
              className="user-menu-item"
              onClick={() => {
                setOpen(false);
                onViewProfile();
              }}
            >
              <FiUser aria-hidden="true" /> View profile
            </button>
          )}
          <button className="user-menu-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
