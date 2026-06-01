import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function normalizeOption(option) {
  if (option == null) {
    return { key: "__empty__", label: "", raw: option };
  }
  if (typeof option === "object") {
    const label = String(option.label ?? option.value ?? "");
    const key =
      option.value !== undefined && option.value !== null
        ? String(option.value)
        : label;
    return { key, label, raw: option };
  }
  const label = String(option);
  return { key: label, label, raw: option };
}

function displayValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return String(value.label ?? value.value ?? "");
  }
  return String(value);
}

function isSameSelection(value, option) {
  const a = normalizeOption(value);
  const b = normalizeOption(option);
  if (!displayValue(value)) return false;
  if (typeof value === "object" && typeof option === "object") {
    return (
      value.value === option.value &&
      (value.label === option.label || value.label == null || option.label == null)
    );
  }
  return a.key === b.key || a.label === b.label;
}

const RenderDropdown = ({
  value,
  setValue,
  options = [],
  name,
  placeholder,
  label,
  loading = false,
  disabled = false,
}) => {
  const [openDropdownName, setOpenDropdownName] = useState(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const isOpen = openDropdownName === name;
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedOptions = options.map(normalizeOption);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      const inRoot = rootRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inRoot && !inMenu) {
        setOpenDropdownName(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = displayValue(value);

  const menu = (
    <AnimatePresence>
      {isOpen && menuStyle && (
        <motion.ul
          ref={menuRef}
          style={menuStyle}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-xl shadow-lg border border-blue-100 max-h-52 sm:max-h-64 overflow-y-auto text-sm sm:text-base"
          role="listbox"
        >
          {normalizedOptions.map((item) => (
            <li
              key={`${name}-${item.key}`}
              role="option"
              aria-selected={isSameSelection(value, item.raw)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue(item.raw);
                setOpenDropdownName(null);
              }}
              className={`w-full text-right px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50 transition-colors cursor-pointer ${
                isSameSelection(value, item.raw)
                  ? "bg-blue-50 text-blue-700"
                  : ""
              }`}
            >
              {item.label}
            </li>
          ))}

          {normalizedOptions.length === 0 && (
            <li className="px-3 py-2.5 text-gray-400 text-xs sm:text-sm">
              گزینه‌ای یافت نشد
            </li>
          )}
        </motion.ul>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div ref={rootRef} className="relative text-right w-full">
      {label && (
        <label className="block mb-2 text-sm sm:text-base text-blue-700">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpenDropdownName(isOpen ? null : name)}
        className={`w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 flex justify-between items-center gap-2
        text-sm sm:text-base
        focus:outline-none focus:ring-2 focus:ring-blue-300 transition
        disabled:opacity-60 disabled:cursor-not-allowed
        ${selectedLabel ? "text-blue-950" : "text-blue-400"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {loading ? "در حال بارگذاری..." : selectedLabel || placeholder}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs sm:text-sm shrink-0"
        >
          ▼
        </motion.span>
      </button>

      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </motion.div>
  );
};

export default RenderDropdown;
