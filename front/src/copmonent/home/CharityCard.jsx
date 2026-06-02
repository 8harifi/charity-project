import React from 'react';
import { 
  FaHeart, 
  FaCalendarAlt, 
  FaTag, 
  FaShareAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const CharityCard = ({
  image,
  title,
  description,
  targetAmount,
  raisedAmount,
  progress,
  urgency,
  category,
  buttonText,
  buttonColor,
  daysLeft,
  supporters,
  featured = false,
  onFavoriteClick,
  onShareClick,
  onDonateClick,
  isFavorite = false
}) => {

  const urgencyStyles = {
    'فوری': {
      color: "from-red-500 to-red-600",
      text: "🔥 فوری"
    },
    'متوسط': {
      color: "from-yellow-500 to-yellow-600",
      text: "⚠️ متوسط"
    },
    'عادی': {
      color: "from-green-500 to-green-600",
      text: "✅ عادی"
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={`w-full rounded-2xl p-5 shadow-xl bg-white/80 backdrop-blur-sm border
        ${featured ? "border-blue-400 shadow-blue-200" : "border-blue-100"}
        transition-all relative overflow-hidden`}
    >

      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-medium shadow">
          ⭐ ویژه
        </div>
      )}

      <div className="relative mb-4 rounded-xl overflow-hidden shadow">
        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3 }}
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="absolute top-4 left-4 flex gap-2">
        {onFavoriteClick && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={onFavoriteClick}
            className="p-3 rounded-xl bg-white shadow-lg hover:bg-red-50"
          >
            <FaHeart
              className={`text-lg ${
                isFavorite ? "text-red-500" : "text-gray-400"
              }`}
            />
          </motion.button>
        )}

        {onShareClick && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={onShareClick}
            className="p-3 rounded-xl bg-white shadow-lg hover:bg-blue-50"
          >
            <FaShareAlt className="text-lg text-blue-500" />
          </motion.button>
        )}
      </div>

      <div className={`inline-block mb-4 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow
        bg-gradient-to-r ${urgencyStyles[urgency]?.color}`}>
        {urgencyStyles[urgency]?.text}
      </div>

      <h3 className="text-xl font-bold text-blue-900 mb-2">{title}</h3>

      <p className="text-blue-800 text-sm leading-relaxed mb-4">
        {description}
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-blue-700 mb-1">
          <span>جمع‌آوری شده: {raisedAmount} تومان</span>
          <span>هدف: {targetAmount} تومان</span>
        </div>

        <div className="w-full bg-blue-100 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
          />
        </div>

        <p className="text-right text-blue-600 text-xs mt-1">
          {progress}% تکمیل شده
        </p>
      </div>

      <div className="flex justify-between text-sm text-blue-500 mb-6">
        <div className="flex items-center gap-1">
          <FaHeart className="text-red-500" />
          {supporters} حامی
        </div>
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-blue-600" />
          {daysLeft} روز مانده
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onDonateClick}
        className={`w-full py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all
          ${buttonColor || "bg-gradient-to-r from-blue-500 to-blue-600"}`}
      >
        {buttonText || "حمایت"}
      </motion.button>

    </motion.div>
  );
};

export default CharityCard;
