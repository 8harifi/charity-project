import { motion } from "framer-motion";

/**
 * Progress bar for fund requests (collected vs amount_needed).
 */
export default function FundingProgressBar({
  collected = 0,
  needed = 0,
  size = "md",
  showLabels = true,
  showPercent = true,
  className = "",
}) {
  const neededNum = Number(needed) || 0;
  const collectedNum = Number(collected) || 0;

  if (neededNum <= 0) return null;

  const percent = Math.min(100, Math.round((collectedNum / neededNum) * 100));
  const remaining = Math.max(0, neededNum - collectedNum);

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };
  const barH = heights[size] || heights.md;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center gap-2 text-xs text-gray-600">
          <span>
            <span className="font-semibold text-emerald-700">
              {collectedNum.toLocaleString("fa-IR")}
            </span>
            {" از "}
            <span className="font-medium">{neededNum.toLocaleString("fa-IR")}</span>
            {" تومان"}
          </span>
          {showPercent && (
            <span className="font-bold text-emerald-600 shrink-0">{percent}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${barH}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${barH} rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400`}
        />
      </div>
      {showLabels && remaining > 0 && size !== "sm" && (
        <p className="text-xs text-gray-400">
          باقی‌مانده: {remaining.toLocaleString("fa-IR")} تومان
        </p>
      )}
    </div>
  );
}

export function fundingPercent(collected, needed) {
  const n = Number(needed) || 0;
  const c = Number(collected) || 0;
  if (n <= 0) return 0;
  return Math.min(100, Math.round((c / n) * 100));
}
