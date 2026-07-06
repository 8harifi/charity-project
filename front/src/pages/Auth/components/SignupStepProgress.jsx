import { Check } from "lucide-react";

/**
 * Visual step progress indicator for multi-page signup flows.
 * `steps` is an array of string labels; `currentStep` is 1-indexed.
 */
export default function SignupStepProgress({ steps, currentStep }) {
  if (!steps?.length) return null;
  const total = steps.length;
  const progressPercent = total > 1 ? ((currentStep - 1) / (total - 1)) * 100 : 100;

  return (
    <div className="mb-8 sm:mb-10" dir="rtl">
      <div className="relative">
        <div className="absolute top-4 right-0 left-0 h-1 bg-blue-100 rounded-full" />
        <div
          className="absolute top-4 right-0 h-1 bg-gradient-to-l from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((label, idx) => {
            const stepNumber = idx + 1;
            const isDone = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            return (
              <div key={label} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                        ? "bg-white border-blue-500 text-blue-600 ring-4 ring-blue-100"
                        : "bg-white border-blue-100 text-blue-300"
                  }`}
                >
                  {isDone ? <Check size={16} /> : stepNumber}
                </div>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-semibold text-center px-1 truncate w-full ${
                    isActive ? "text-blue-700" : isDone ? "text-emerald-600" : "text-blue-300"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
