import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar } from "lucide-react";

const baseInputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 text-right cursor-pointer bg-white";

/**
 * Persian (Jalali) calendar date input. Clicking anywhere on the field opens
 * the picker. Stores/emits value as a "YYYY/MM/DD" Jalali string.
 */
export default function PersianDateInput({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className = "",
  name,
}) {
  return (
    <div className="relative">
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={value || ""}
        onChange={(date) => onChange?.(date ? date.format("YYYY/MM/DD") : "")}
        format="YYYY/MM/DD"
        inputClass={`${baseInputClass} ${className}`}
        containerClassName="w-full"
        placeholder={placeholder}
        editable={false}
        name={name}
        calendarPosition="bottom-right"
      />
      <Calendar
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
