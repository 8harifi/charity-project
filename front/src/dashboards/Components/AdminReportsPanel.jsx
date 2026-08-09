import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { adminReportsService } from "../../Services/adminReportsService";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";

const CATEGORIES = [
  { id: "transactions", label: "تراکنش‌ها" },
  { id: "donations", label: "کمک‌ها و تعهدات" },
  { id: "workflow", label: "گردش کار درخواست‌ها" },
  { id: "requests", label: "درخواست‌ها" },
  { id: "registrations", label: "کاربران و عضویت" },
  { id: "staff", label: "درخواست‌های پرسنلی" },
];

const FETCHERS = {
  transactions: (p) => adminReportsService.listTransactions(p),
  gateway: (p) => adminReportsService.listGatewayPayments(p),
  donations: (p) => adminReportsService.listDonations(p),
  pledges: (p) => adminReportsService.listPledges(p),
  workflow: (p) => adminReportsService.listWorkflow(p),
  requests: (p) => adminReportsService.listRequests(p),
  registrations: (p) => adminReportsService.listRegistrations(p),
  staff: (p) => adminReportsService.listStaffRequests(p),
};

const EXPORT_PATHS = {
  transactions: "transactions",
  gateway: "gateway-payments",
  donations: "donations",
  pledges: "pledges",
  workflow: "workflow",
  requests: "requests",
  registrations: "registrations",
  staff: "staff-requests",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return String(value);
  }
}

function formatAmount(value) {
  if (value == null || value === "") return "—";
  return Number(value).toLocaleString("fa-IR");
}

function ReportFilters({
  search,
  onSearchChange,
  showAdvanced,
  onToggleAdvanced,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  status,
  onStatus,
  statusOptions,
  role,
  onRole,
  province,
  onProvince,
  extra,
  onClear,
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="button"
          onClick={onToggleAdvanced}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${
            showAdvanced ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <SlidersHorizontal size={18} />
          فیلتر پیشرفته
        </button>
      </div>
      {showAdvanced && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">از تاریخ</label>
            <input type="date" value={dateFrom} onChange={(e) => onDateFrom(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">تا تاریخ</label>
            <input type="date" value={dateTo} onChange={(e) => onDateTo(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm" />
          </div>
          {statusOptions && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">وضعیت</label>
              <select value={status} onChange={(e) => onStatus(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm bg-white">
                <option value="">همه</option>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          {onRole && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">نقش</label>
              <select value={role} onChange={(e) => onRole(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm bg-white">
                <option value="">همه</option>
                <option value="patient">بیمار</option>
                <option value="doctor">پزشک</option>
                <option value="health_assistant">سلامتیار</option>
                <option value="benefactor">خیر</option>
              </select>
            </div>
          )}
          {onProvince && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">استان</label>
              <select value={province} onChange={(e) => onProvince(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm bg-white">
                <option value="">همه</option>
                {IRAN_PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
          {extra}
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <X size={16} />
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, pageSize, count, onPage }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>
        صفحه {page} از {totalPages} — {count.toLocaleString("fa-IR")} مورد
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-2 rounded-lg border disabled:opacity-40">
          <ChevronRight size={18} />
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="p-2 rounded-lg border disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}

function useReportFetcher(fetchKey, buildParams) {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher = FETCHERS[fetchKey];
      const r = await fetcher({ ...buildParams(), page, page_size: pageSize });
      setRows(r.data?.results || []);
      setCount(r.data?.count ?? 0);
    } catch {
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [fetchKey, buildParams, page]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, count, page, setPage, pageSize, loading, reload: load };
}

function ReportSection({ title, fetchKey, columns, renderRow, filters, onExport }) {
  const buildParams = useMemo(() => filters.buildParams, [filters]);
  const { rows, count, page, setPage, pageSize, loading } = useReportFetcher(fetchKey, buildParams);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {onExport && (
          <button type="button" onClick={() => onExport(buildParams())} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">
            <Download size={16} />
            خروجی CSV
          </button>
        )}
      </div>
      {filters.ui}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">موردی یافت نشد.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-right min-w-[640px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => renderRow(row))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} count={count} onPage={setPage} />
    </div>
  );
}

function useFilterState() {
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [province, setProvince] = useState("");

  const buildParams = useCallback(() => {
    const p = { page: 1 };
    if (search.trim()) p.search = search.trim();
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    if (status) p.status = status;
    if (role) p.role = role;
    if (province) p.province = province;
    return p;
  }, [search, dateFrom, dateTo, status, role, province]);

  const clear = () => {
    setDateFrom("");
    setDateTo("");
    setStatus("");
    setRole("");
    setProvince("");
  };

  return {
    search, setSearch, showAdvanced, setShowAdvanced,
    dateFrom, setDateFrom, dateTo, setDateTo,
    status, setStatus, role, setRole, province, setProvince,
    buildParams, clear,
  };
}

async function downloadCsv(path, params) {
  try {
    const r = await adminReportsService.exportCsv(path, params);
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${path}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  }
}

export default function AdminReportsPanel() {
  const [category, setCategory] = useState("transactions");
  const [txSub, setTxSub] = useState("wallet");
  const [donSub, setDonSub] = useState("donations");
  const f = useFilterState();

  const filterUi = (
    <ReportFilters
      search={f.search}
      onSearchChange={f.setSearch}
      showAdvanced={f.showAdvanced}
      onToggleAdvanced={() => f.setShowAdvanced((v) => !v)}
      dateFrom={f.dateFrom}
      dateTo={f.dateTo}
      onDateFrom={f.setDateFrom}
      onDateTo={f.setDateTo}
      status={f.status}
      onStatus={f.setStatus}
      statusOptions={
        category === "registrations"
          ? [
              { value: "approved", label: "تأییدشده" },
              { value: "pending", label: "در انتظار تأیید" },
            ]
          : category === "workflow" || category === "requests" || category === "staff"
          ? [
              { value: "pending", label: "در انتظار" },
              { value: "accepted", label: "پذیرفته‌شده" },
              { value: "rejected", label: "رد‌شده" },
              { value: "in_progress", label: "در حال انجام" },
              { value: "completed", label: "تکمیل‌شده" },
              { value: "cancelled", label: "لغوشده" },
            ]
          : category === "donations" && donSub === "pledges"
            ? [
                { value: "held", label: "در تعهد" },
                { value: "released", label: "آزادشده" },
                { value: "refunded", label: "بازگشت" },
              ]
            : category === "transactions" && txSub === "gateway"
              ? [
                  { value: "verified", label: "تأییدشده" },
                  { value: "failed", label: "ناموفق" },
                  { value: "created", label: "ایجادشده" },
                ]
              : undefined
      }
      role={category === "registrations" || category === "workflow" ? f.role : undefined}
      onRole={category === "registrations" || category === "workflow" ? f.setRole : undefined}
      province={category === "requests" ? f.province : undefined}
      onProvince={category === "requests" ? f.setProvince : undefined}
      onClear={f.clear}
    />
  );

  const filters = { buildParams: f.buildParams, ui: filterUi };

  return (
    <div className="text-right" dir="rtl">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">گزارش‌ها</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              category === c.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category === "transactions" && (
        <>
          <div className="flex gap-2 mb-4">
            {[
              { id: "wallet", label: "تراکنش کیف پول" },
              { id: "gateway", label: "درگاه پرداخت" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTxSub(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  txSub === s.id ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {txSub === "wallet" ? (
            <ReportSection
              title="تراکنش‌های کیف پول"
              fetchKey="transactions"
              filters={filters}
              onExport={(p) => downloadCsv(EXPORT_PATHS.transactions, p)}
              columns={["نوع", "مبلغ", "دسته", "صاحب کیف", "توضیح", "تاریخ"]}
              renderRow={(row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{row.entry_type === "credit" ? "واریز" : "برداشت"}</td>
                  <td className="px-4 py-3 font-bold">{formatAmount(row.amount)}</td>
                  <td className="px-4 py-3">{row.kind}</td>
                  <td className="px-4 py-3">{row.wallet_owner}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{row.description || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                </tr>
              )}
            />
          ) : (
            <ReportSection
              title="پرداخت‌های درگاه"
              fetchKey="gateway"
              filters={filters}
              onExport={(p) => downloadCsv(EXPORT_PATHS.gateway, p)}
              columns={["کاربر", "مبلغ", "وضعیت", "کد پیگیری", "تاریخ"]}
              renderRow={(row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{row.user_username}</td>
                  <td className="px-4 py-3 font-bold">{formatAmount(row.amount)}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{row.ref_id || row.authority || "—"}</td>
                  <td className="px-4 py-3">{formatDate(row.created_at)}</td>
                </tr>
              )}
            />
          )}
        </>
      )}

      {category === "donations" && (
        <>
          <div className="flex gap-2 mb-4">
            {[
              { id: "donations", label: "کمک‌ها" },
              { id: "pledges", label: "تعهدات / هولد" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setDonSub(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  donSub === s.id ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {donSub === "donations" ? (
            <ReportSection
              title="کمک‌های ثبت‌شده"
              fetchKey="donations"
              filters={filters}
              onExport={(p) => downloadCsv(EXPORT_PATHS.donations, p)}
              columns={["خیر", "مبلغ", "مقصد", "وضعیت", "تاریخ"]}
              renderRow={(row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{row.benefactor_username}</td>
                  <td className="px-4 py-3 font-bold">{formatAmount(row.amount)}</td>
                  <td className="px-4 py-3">{row.destination_type} {row.campaign_title || row.patient_label || ""}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{formatDate(row.created_at)}</td>
                </tr>
              )}
            />
          ) : (
            <ReportSection
              title="تعهدات مالی"
              fetchKey="pledges"
              filters={filters}
              onExport={(p) => downloadCsv(EXPORT_PATHS.pledges, p)}
              columns={["خیر", "درخواست", "بیمار", "مبلغ", "وضعیت", "تاریخ"]}
              renderRow={(row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{row.benefactor_username}</td>
                  <td className="px-4 py-3">{row.request_subject}</td>
                  <td className="px-4 py-3">{row.patient_label || "—"}</td>
                  <td className="px-4 py-3 font-bold">{formatAmount(row.amount)}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{formatDate(row.created_at)}</td>
                </tr>
              )}
            />
          )}
        </>
      )}

      {category === "workflow" && (
        <ReportSection
          title="گردش کار درخواست‌ها"
          fetchKey="workflow"
          filters={filters}
          onExport={(p) => downloadCsv(EXPORT_PATHS.workflow, p)}
          columns={["درخواست", "بیمار", "وضعیت", "اقدام‌کننده", "یادداشت", "تاریخ"]}
          renderRow={(row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">#{row.request_id} {row.request_subject}</td>
              <td className="px-4 py-3">{row.patient_label || "—"}</td>
              <td className="px-4 py-3">{row.status_label}</td>
              <td className="px-4 py-3">{row.actor_label} {row.actor_role ? `(${row.actor_role})` : ""}</td>
              <td className="px-4 py-3 max-w-xs truncate">{row.note || "—"}</td>
              <td className="px-4 py-3">{formatDate(row.created_at)}</td>
            </tr>
          )}
        />
      )}

      {category === "requests" && (
        <ReportSection
          title="همه درخواست‌ها"
          fetchKey="requests"
          filters={filters}
          onExport={(p) => downloadCsv(EXPORT_PATHS.requests, p)}
          columns={["موضوع", "نوع", "بیمار", "وضعیت", "مبلغ", "ثبت‌کننده", "تاریخ"]}
          renderRow={(row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{row.subject}</td>
              <td className="px-4 py-3">{row.request_type}</td>
              <td className="px-4 py-3">{row.patient_label || "—"}</td>
              <td className="px-4 py-3">{row.status_label}</td>
              <td className="px-4 py-3">{formatAmount(row.collected_amount)} / {formatAmount(row.amount_needed)}</td>
              <td className="px-4 py-3">{row.created_by_username}</td>
              <td className="px-4 py-3">{formatDate(row.created_at)}</td>
            </tr>
          )}
        />
      )}

      {category === "registrations" && (
        <ReportSection
          title="کاربران و عضویت"
          fetchKey="registrations"
          filters={{
            ...filters,
            buildParams: () => {
              const p = f.buildParams();
              if (f.status === "approved") p.state = "approved";
              if (f.status === "pending") p.state = "pending";
              delete p.status;
              return p;
            },
          }}
          onExport={(p) => downloadCsv(EXPORT_PATHS.registrations, p)}
          columns={["نام", "موبایل", "نقش", "وضعیت", "استان", "تاریخ عضویت"]}
          renderRow={(row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{row.display_name}</td>
              <td className="px-4 py-3">{row.username}</td>
              <td className="px-4 py-3">{row.role}</td>
              <td className="px-4 py-3">{row.state ? "فعال" : "در انتظار"}</td>
              <td className="px-4 py-3">{row.province || "—"}</td>
              <td className="px-4 py-3">{formatDate(row.date_joined)}</td>
            </tr>
          )}
        />
      )}

      {category === "staff" && (
        <ReportSection
          title="درخواست‌های پرسنلی (پزشک → سلامتیار)"
          fetchKey="staff"
          filters={filters}
          onExport={(p) => downloadCsv(EXPORT_PATHS.staff, p)}
          columns={["موضوع", "پزشک", "سلامتیار", "بیمار", "وضعیت", "تاریخ"]}
          renderRow={(row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{row.subject}</td>
              <td className="px-4 py-3">{row.doctor_username}</td>
              <td className="px-4 py-3">{row.health_assistant_label}</td>
              <td className="px-4 py-3">{row.patient_label || "—"}</td>
              <td className="px-4 py-3">{row.status_label}</td>
              <td className="px-4 py-3">{formatDate(row.created_at)}</td>
            </tr>
          )}
        />
      )}

    </div>
  );
}
