import { FiCheck, FiCircle, FiFlag } from "react-icons/fi";

const OPTIONS = [
  { value: "TODO", label: "To-do", Icon: FiCircle, active: "bg-todo-soft text-todo", idle: "text-ink-soft/50 hover:text-ink-soft" },
  { value: "DONE", label: "Done", Icon: FiCheck, active: "bg-done-soft text-done", idle: "text-ink-soft/50 hover:text-ink-soft" },
  { value: "REVISE", label: "Revise", Icon: FiFlag, active: "bg-revise-soft text-revise", idle: "text-ink-soft/50 hover:text-ink-soft" },
];

export default function StatusPicker({ status, onChange }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Problem status">
      {OPTIONS.map((opt) => {
        const active = status === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            aria-pressed={active}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
            }}
            className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors
              ${active ? opt.active : opt.idle}`}
          >
            <opt.Icon aria-hidden="true" className="h-[15px] w-[15px]" />
          </button>
        );
      })}
    </div>
  );
}
