import { Clock } from "lucide-react";

const baseInputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 text-right bg-white";

/**
 * Native time input, stores/emits value as "HH:mm".
 * Replaces the previous custom picker (react-multi-date-picker), which could
 * get stuck open inside modals; the native control is far more reliable.
 */
export default function PersianTimeInput({
  value,
  onChange,
  placeholder = "انتخاب ساعت",
  className = "",
  name,
}) {
  return (
    <div className="relative">
      <input
        type="time"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        name={name}
        className={`${baseInputClass} ${className}`}
      />
      <Clock
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
