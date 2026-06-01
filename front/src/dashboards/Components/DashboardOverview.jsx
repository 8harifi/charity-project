import { motion } from "framer-motion";

export default function DashboardOverview({ cards }) {
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
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gradient-to-br from-blue-50 to-emerald-50 border border-gray-100 rounded-2xl p-6"
          >
            <p className="text-3xl font-bold text-emerald-700 mb-2">{card.value}</p>
            <p className="text-gray-600 text-sm">{card.label}</p>
            {card.hint && (
              <p className="text-gray-400 text-xs mt-2">{card.hint}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
