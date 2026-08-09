import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { requestService } from "../../Services/dashboardApi";

export default function OrgSubordinatesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [haId, setHaId] = useState("");
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await requestService.orgSubordinates();
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLink = async () => {
    setMsg("");
    setMsgIsError(false);
    const id = Number(haId);
    if (!id) {
      setMsgIsError(true);
      setMsg("شناسه سلامتیار نامعتبر است.");
      return;
    }
    try {
      await requestService.linkOrgSubordinate(id);
      setHaId("");
      setMsg("سلامتیار به فهرست زیرمجموعه‌های در انتظار اضافه شد.");
      load();
    } catch (err) {
      setMsgIsError(true);
      setMsg(err.response?.data?.detail || "خطا در افزودن زیرمجموعه.");
    }
  };

  const handleAction = async (id, action) => {
    setBusyId(id);
    setMsg("");
    setMsgIsError(false);
    try {
      await requestService.orgSubordinateAction(id, action);
      setMsg(action === "approve" ? "تأیید شد." : "رد و جدا شد.");
      load();
    } catch (err) {
      setMsgIsError(true);
      setMsg(err.response?.data?.detail || "خطا در انجام عملیات.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">زیرمجموعه‌های سازمان</h2>
        <p className="text-sm text-gray-500 mt-1">
          سلامتیارانی که زیرمجموعه این سازمان کار می‌کنند را تأیید یا رد کنید.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 p-3 border rounded-xl"
          placeholder="شناسه سلامتیار برای افزودن"
          value={haId}
          onChange={(e) => setHaId(e.target.value)}
        />
        <button
          type="button"
          onClick={handleLink}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold"
        >
          افزودن
        </button>
      </div>

      {msg && (
        <p className={`text-sm ${msgIsError ? "text-red-600" : "text-blue-700"}`}>{msg}</p>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl">
          زیرمجموعه‌ای ثبت نشده است.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  کد: {item.health_assistance_code} — شناسه: {item.id}
                </p>
                <p className="text-sm mt-1">
                  {item.org_approved ? (
                    <span className="text-emerald-700">تأیید شده</span>
                  ) : (
                    <span className="text-amber-700">در انتظار تأیید</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {!item.org_approved && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleAction(item.id, "approve")}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    تأیید
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleAction(item.id, "reject")}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  رد / جدا کردن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
