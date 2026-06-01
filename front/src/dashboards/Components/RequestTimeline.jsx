import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const STATUS_LABELS = {
  pending: "در انتظار بررسی",
  accepted: "پذیرفته شده",
  rejected: "رد شده",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
};

export default function RequestTimeline({ logs = [] }) {
  if (!logs.length) {
    return <p className="text-gray-400 text-sm">گردش کار ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-4 text-right">
      {logs.map((log, idx) => {
        const isLast = idx === logs.length - 1;
        return (
          <motion.div
            key={log.id || idx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              {isLast ? (
                <CheckCircle2 className="text-emerald-600" size={20} />
              ) : (
                <CheckCircle2 className="text-emerald-400" size={20} />
              )}
              {idx < logs.length - 1 && (
                <div className="w-0.5 flex-1 bg-emerald-200 min-h-[24px] mt-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-semibold text-gray-800">
                {log.status_label || STATUS_LABELS[log.status] || log.status}
              </p>
              {log.note && (
                <p className="text-sm text-gray-600 mt-1">{log.note}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {log.actor_name && `${log.actor_name} — `}
                {log.created_at
                  ? new Date(log.created_at).toLocaleDateString("fa-IR")
                  : ""}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { STATUS_LABELS };
