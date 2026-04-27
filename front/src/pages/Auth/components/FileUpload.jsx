import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";

const FileUpload = ({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5, // MB
  onChange,
  value,
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(value || null);

  useEffect(() => {
    setFile(value || null);
  }, [value]);
  const [error, setError] = useState("");

  const handleFile = async (selectedFile) => {
    setError("");

    if (!selectedFile) return;

    // بررسی حجم
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`حجم فایل نباید بیشتر از ${maxSize} مگابایت باشد.`);
      return;
    }

    const base64 = await fileToBase64(selectedFile);

const fileData = {
  name: selectedFile.name,
  base64: base64,
};

setFile(fileData);

if (onChange) {
  onChange(fileData);
}

  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
    onChange && onChange(null);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-blue-700 mb-2 text-sm sm:text-base text-right">
          {label}
        </label>
      )}

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="
          relative w-full 
          p-4 sm:p-6 
          bg-blue-50/50 rounded-2xl 
          border-2 border-dashed border-blue-200 
          text-center cursor-pointer transition-all
        "
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center text-blue-500">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-3" />

            {/* متن اصلی */}
            <p className="text-sm sm:text-lg font-medium">
              برای انتخاب فایل کلیک کنید
            </p>
          </div>
        ) : (
          <div
            className="
              flex items-center justify-between 
              bg-white p-3 sm:p-4 
              rounded-xl shadow-sm
            "
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />

              <span className="text-blue-900 font-medium text-xs sm:text-sm">
                {file.name}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-right text-xs sm:text-sm mt-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
