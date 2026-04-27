import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LegalReferrerSelector({
  legalType,
  setLegalType,
  legalSubType,
  setLegalSubType,
  legalName,
  setLegalName,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  const legalTypes = [
    "مطب پزشک",
    "مرکز خدمات سلامت",
    "مرکز نیکوکاری",
    "مرکز درمانی",
    "سازمان دولتی",
    "شرکت خصوصی","تشکل"
  ];

  const legalSubTypes = {
    "مرکز خدمات سلامت": [
     "آزمایشگاه","تصویربرداری","داروخانه"
    ],
    "مرکز درمانی": [
      "مرکز بهداشت",
      "کلینیک",
      "مرکز تخصصی",
      "بیمارستان"
    ],
    "سازمان دولتی": ["دانشگاه علوم پزشکی", "سازمان بهزیستی"],
    "شرکت خصوصی":["عمرانی","تاسیساتی"],
    "تشکل ها":["دهیاری","خادمیاران آستان رضوی","مسجد","پایگاه بسیج مساجد","کانون فرهنگی هنری مساجد"]
  };

  const legalNames = ["مجموعه سلامتیار تهران", "مجموعه سلامتیار البرز"];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDropdown = (
    value,
    setValue,
    options,
    name,
    placeholder,
    label
  ) => {
    const isOpen = openDropdown === name;

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-xs sm:text-sm text-slate-700">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : name)}
            className={`
              w-full flex items-center justify-between
              px-3 py-2 sm:px-4 sm:py-2.5
              bg-white border rounded-xl
              text-xs sm:text-sm
              transition-all
              ${isOpen ? "border-blue-500 shadow-md" : "border-slate-300"}
              focus:outline-none focus:ring-2 focus:ring-blue-400/60
            `}
          >
            <span
              className={`truncate text-right ${
                value ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {value || placeholder}
            </span>

            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 text-[10px] sm:text-xs text-slate-500"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                initial={{ opacity: 0, scaleY: 0.9, y: -4 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute z-30 w-full mt-1
                  bg-white border border-slate-200
                  rounded-xl shadow-lg
                  origin-top
                  max-h-40 sm:max-h-52
                  overflow-y-auto
                "
              >
                {options.map((option) => (
                  <li
                    key={option}
                    onClick={() => {
                      setValue(option);
                      setOpenDropdown(null);
                    }}
                    className={`
                      px-3 py-2 sm:px-4 sm:py-2.5
                      text-xs sm:text-sm
                      cursor-pointer text-right
                      hover:bg-blue-50
                      ${
                        value === option
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700"
                      }
                    `}
                  >
                    {option}
                  </li>
                ))}

                {options.length === 0 && (
                  <li className="px-3 py-2 text-xs sm:text-sm text-slate-400">
                    گزینه‌ای یافت نشد
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="space-y-4 sm:space-y-6 legal-selector"
    >
      {renderDropdown(
        legalType,
        (val) => {
          setLegalType(val);
          setLegalSubType("");
          setLegalName("");
        },
        legalTypes,
        "legalType",
        "انتخاب نوع مجموعه",
        "نوع مجموعه سلامت‌یار"
      )}

     {legalType &&
 !["مطب پزشک", "مرکز نیکوکاری"].includes(legalType) &&
  renderDropdown(
    legalSubType,
    setLegalSubType,
    legalSubTypes[legalType] || [],
    "legalSubType",
    "انتخاب زیرمجموعه",
    "زیرمجموعه"
  )}


      {legalSubType &&
        renderDropdown(
          legalName,
          setLegalName,
          legalNames,
          "legalName",
          "انتخاب نام زیر مجموعه",
          "نام زیرمجموعه"
        )}
    </div>
  );
}
