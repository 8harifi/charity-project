import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import FundingProgressBar from "../../components/FundingProgressBar";
import { requestService } from "../../Services/dashboardApi";

const STATUS_COLORS = {
  pending: "border-amber-300 bg-amber-50",
  accepted: "border-blue-300 bg-blue-50",
  rejected: "border-red-300 bg-red-50",
  in_progress: "border-purple-300 bg-purple-50",
  completed: "border-emerald-300 bg-emerald-50",
  cancelled: "border-gray-300 bg-gray-50",
};

export default function PatientWorkflowTimeline({ patientId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    requestService
      .patientWorkflow(patientId)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-emerald-600" size={20} />
      </div>
    );
  }

  const requests = data?.requests || [];
  if (!requests.length) {
    return <p className="text-gray-400 text-sm">هنوز درخواستی برای این بیمار ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`border-r-4 rounded-lg p-3 text-sm ${
            STATUS_COLORS[req.status] || "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-gray-800">{req.subject}</span>
            <span className="text-xs text-gray-500 shrink-0">{req.status_label}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{req.request_type_label}</p>
          {req.amount_needed > 0 && (
            <div className="mt-2">
              <FundingProgressBar
                collected={req.collected_amount}
                needed={req.amount_needed}
                size="sm"
                showLabels={false}
              />
              <p className="text-xs text-emerald-700 mt-1">
                {Number(req.collected_amount || 0).toLocaleString("fa-IR")} /{" "}
                {Number(req.amount_needed).toLocaleString("fa-IR")} تومان
              </p>
            </div>
          )}
          {req.confirmation_message && (
            <p className="text-xs text-gray-600 mt-1">{req.confirmation_message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {req.created_at ? new Date(req.created_at).toLocaleDateString("fa-IR") : ""}
            {req.handled_by_name ? ` — ${req.handled_by_name}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
