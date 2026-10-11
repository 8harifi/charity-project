import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { requestService } from "../../Services/dashboardApi";

export default function ContactInboxPanel() {
  const [messages, setMessages] = useState([]);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyDraft, setReplyDraft] = useState({});
  const [sendSms, setSendSms] = useState({});
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inbox, disclosure] = await Promise.all([
        requestService.contactInbox(),
        requestService.contactDisclosureInbox().catch(() => ({ data: [] })),
      ]);
      setMessages(Array.isArray(inbox.data) ? inbox.data : []);
      setDisclosures(Array.isArray(disclosure.data) ? disclosure.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "بارگذاری صندوق پیام ممکن نشد.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reply = async (id) => {
    const text = (replyDraft[id] || "").trim();
    if (!text) return;
    setActingId(id);
    try {
      await requestService.replyContact(id, {
        reply: text,
        send_sms: sendSms[id] !== false,
      });
      setReplyDraft((d) => ({ ...d, [id]: "" }));
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "ارسال پاسخ با خطا مواجه شد.");
    } finally {
      setActingId(null);
    }
  };

  const setDisclosureStatus = async (id, status) => {
    setActingId(`d-${id}`);
    try {
      await requestService.updateContactDisclosure(id, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "تغییر وضعیت ممکن نشد.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-8">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2 justify-end">
          صندوق پیام‌های تماس با ما
          <MessageCircle size={22} className="text-blue-600" />
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          پیام‌های راهنمای بیمار، همیار شبکه و درخواست مشخصات تماس. پاسخ کوتاه پیامکی برای فرستنده ارسال می‌شود.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">پیامی در صندوق نیست.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-800">{m.subject || "بدون موضوع"}</p>
                    <p className="text-sm text-gray-500">
                      {m.name} — {m.phone}
                      {m.region ? ` — ${m.region}` : ""}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 h-fit">
                    {m.status_label || m.intent_label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
                {m.reply && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-2">پاسخ: {m.reply}</p>
                )}
                {m.status !== "answered" && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      value={replyDraft[m.id] || ""}
                      onChange={(e) => setReplyDraft((d) => ({ ...d, [m.id]: e.target.value }))}
                      placeholder="پاسخ کوتاه..."
                      className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600 justify-end">
                      ارسال پیامک اطلاع‌رسانی
                      <input
                        type="checkbox"
                        checked={sendSms[m.id] !== false}
                        onChange={(e) => setSendSms((s) => ({ ...s, [m.id]: e.target.checked }))}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={actingId === m.id}
                      onClick={() => reply(m.id)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {actingId === m.id ? "..." : "ارسال پاسخ"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3">درخواست‌های مشخصات تماس بیمار</h3>
        {disclosures.length === 0 ? (
          <p className="text-gray-500 text-sm">موردی ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {disclosures.map((d) => (
              <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{d.patient_name}</p>
                  <p className="text-xs text-gray-500">
                    خیر: {d.benefactor_username} — {d.status_label}
                  </p>
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actingId === `d-${d.id}`}
                      onClick={() => setDisclosureStatus(d.id, "approved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs"
                    >
                      تأیید و اطلاع‌رسانی
                    </button>
                    <button
                      type="button"
                      disabled={actingId === `d-${d.id}`}
                      onClick={() => setDisclosureStatus(d.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs"
                    >
                      رد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
