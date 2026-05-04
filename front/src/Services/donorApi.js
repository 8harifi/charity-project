// src/services/donorApi.js
import axios from 'axios';

const API_BASE_URL = 'https://your-api-domain.com/api';

// ساخت instance از axios با تنظیمات پیش‌فرض
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor برای اضافه کردن توکن به هر درخواست
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor برای مدیریت خطاها
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('لطفاً دوباره وارد شوید'));
    }
    
    const message = error.response?.data?.message || 'خطایی رخ داده است';
    return Promise.reject(new Error(message));
  }
);

// API Functions
export const donorApi = {
  // دریافت پروفایل خیر
  getProfile: () => apiClient.get('/donor/profile'),

  // به‌روزرسانی پروفایل
  updateProfile: (profileData) => apiClient.put('/donor/profile', profileData),

  // دریافت لیست کمک‌ها
  getDonations: (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    return apiClient.get('/donor/donations', { params });
  },

  // دریافت گزارش مصرف یک کمک خاص
  getReports: (donationId) => apiClient.get(`/donor/donations/${donationId}/reports`),

  // دانلود گزارش به صورت PDF
  downloadReport: async (reportId) => {
    const response = await apiClient.get(`/donor/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // دریافت لیست فاکتورها
  getReceipts: () => apiClient.get('/donor/receipts'),

  // دانلود فاکتور
  downloadReceipt: async (receiptId) => {
    const response = await apiClient.get(`/donor/receipts/${receiptId}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // دریافت کمپین‌های مورد علاقه
  getFavoriteCampaigns: () => apiClient.get('/donor/favorites'),

  // اضافه/حذف کمپین از علاقه‌مندی‌ها
  toggleFavorite: (campaignId) => apiClient.post(`/donor/favorites/${campaignId}`)
};

export default donorApi;
