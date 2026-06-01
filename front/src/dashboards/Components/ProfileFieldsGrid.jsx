import { renderProfileFieldValue } from "../../utils/profileMappers";

export default function ProfileFieldsGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {fields.map((item) => (
        <div
          key={item.label}
          className={`bg-gray-50 p-4 sm:p-6 rounded-xl ${
            item.fullWidth ? "md:col-span-2" : ""
          }`}
        >
          <label className="text-gray-500 text-sm block mb-1">{item.label}</label>
          <p className="font-semibold text-gray-800 break-words">
            {renderProfileFieldValue(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
