import { motion } from "framer-motion";

const CHART_COLORS = ["#059669", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatusChart({ title, data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
      {title && <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={item.label}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-gray-600">{item.label}</span>
              <span className="text-xs font-bold text-gray-800">{item.value}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color || CHART_COLORS[idx % CHART_COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardOverview({ cards, chart, chartTitle }) {
  if (!cards?.length) {
    return (
      <p className="text-gray-500 text-center py-8">اطلاعاتی برای نمایش وجود ندارد.</p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-right"
    >
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6">پیشخوان</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-gradient-to-br from-blue-50 to-emerald-50 border border-gray-100 rounded-2xl p-6 relative overflow-hidden"
            >
              {Icon && (
                <div className="absolute left-4 top-4 w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-emerald-600">
                  <Icon size={20} />
                </div>
              )}
              <p className="text-3xl font-bold text-emerald-700 mb-2">{card.value}</p>
              <p className="text-gray-600 text-sm">{card.label}</p>
              {card.hint && (
                <p className="text-gray-400 text-xs mt-2">{card.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      {chart?.length > 0 && <StatusChart title={chartTitle || "وضعیت درخواست‌ها"} data={chart} />}
    </motion.div>
  );
}
