import { FiCheck, FiCircle, FiFlag } from "react-icons/fi";

const OPTIONS = [
  { value: "TODO", label: "To-do", Icon: FiCircle },
  { value: "DONE", label: "Done", Icon: FiCheck },
  { value: "REVISE", label: "Revise", Icon: FiFlag },
];

export default function StatusPicker({ status, onChange }) {
  return (
    <div className="status-picker" role="group" aria-label="Problem status">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`status-option status-${opt.value.toLowerCase()} ${status === opt.value ? "active" : ""}`}
          title={opt.label}
          aria-pressed={status === opt.value}
          onClick={(e) => {
            e.stopPropagation();
            onChange(opt.value);
          }}
        >
          <opt.Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
