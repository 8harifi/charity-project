export default function RequiredLabel({
  children,
  required = true,
  className = "",
  htmlFor,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-semibold text-gray-700 mb-1 ${className}`}
    >
      {required && <span className="text-red-500 ml-1">*</span>}
      {children}
    </label>
  );
}
