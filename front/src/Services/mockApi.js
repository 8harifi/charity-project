// src/services/mockApi.js

import {
  mockDonorProfile,
  mockDonations,
  mockReports,
  mockReceipts,
  mockFavoriteCampaigns
} from './mockData';

// شبیه‌سازی تاخیر شبکه
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDonorApi = {
  // دریافت پروفایل
  getProfile: async () => {
    await delay();
    return { data: mockDonorProfile };
  },

  // به‌روزرسانی پروفایل
  updateProfile: async (profileData) => {
    await delay();
    return { data: { ...mockDonorProfile, ...profileData } };
  },

  // دریافت لیست کمک‌ها
  getDonations: async (params = {}) => {
    await delay();
    let filtered = [...mockDonations];

    // فیلتر بر اساس وضعیت
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter(d => d.status === params.status);
    }

    // جستجو
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.patientName.toLowerCase().includes(searchLower) ||
        d.category.toLowerCase().includes(searchLower)
      );
    }

    return { data: filtered };
  },

  // دریافت گزارش مصرف
  getReports: async (donationId) => {
    await delay();
    const report = mockReports.find(r => r.donationId === donationId);
    return { data: report || null };
  },

  // دانلود گزارش (شبیه‌سازی)
  downloadReport: async (reportId) => {
    await delay();
    // در حالت واقعی، یک فایل PDF برمی‌گردد
    const blob = new Blob(['گزارش مصرف کمک'], { type: 'application/pdf' });
    return { data: blob };
  },

  // دریافت فاکتورها
  getReceipts: async () => {
    await delay();
    return { data: mockReceipts };
  },

  // دانلود فاکتور (شبیه‌سازی)
  downloadReceipt: async (receiptId) => {
    await delay();
    const blob = new Blob(['فاکتور مالی'], { type: 'application/pdf' });
    return { data: blob };
  },

  // دریافت کمپین‌های مورد علاقه
  getFavoriteCampaigns: async () => {
    await delay();
    return { data: mockFavoriteCampaigns };
  },

  // تغییر وضعیت علاقه‌مندی
  toggleFavorite: async (campaignId) => {
    await delay();
    const campaign = mockFavoriteCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.isFavorite = !campaign.isFavorite;
    }
    return { data: { success: true } };
  }
};
