import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

/**
 * Reusable confirmation modal for destructive or payment actions.
 * Renders nothing when `open` is false.
 */
export default function ConfirmDialog({
  open,
  title = "تأیید عملیات",
  message = "آیا از انجام این عملیات مطمئن هستید؟",
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl w-full max-w-sm p-6 text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full ${
                    tone === "danger" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  <AlertTriangle size={18} />
                </span>
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              </div>
              <button type="button" onClick={onCancel} aria-label="بستن">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${confirmClass}`}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
