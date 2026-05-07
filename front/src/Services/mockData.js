// src/services/mockData.js

export const mockDonorProfile = {
  name: "علی احمدی",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
  memberSince: "1402/05/12",
  badge: "خیر طلایی",
  helpedPatients: 15,
  activeCampaigns: 3,
  totalDonations: 25000000,
  phone: "09123456789",
  email: "ali.ahmadi@example.com",
  nationalId: "0123456789",
  address: "تهران، خیابان ولیعصر، پلاک 123"
};

export const mockDonations = [
  {
    id: 1,
    patientName: "محمد رضایی",
    patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad",
    amount: 5000000,
    date: "1403/02/05",
    status: "completed",
    category: "جراحی قلب",
    campaignTitle: "کمک به عمل جراحی قلب محمد"
  },
  {
    id: 2,
    patientName: "فاطمه کریمی",
    patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatemeh",
    amount: 3000000,
    date: "1403/01/28",
    status: "completed",
    category: "شیمی‌درمانی",
    campaignTitle: "کمک به درمان سرطان فاطمه"
  },
  {
    id: 3,
    patientName: "حسین محمدی",
    patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hossein",
    amount: 2000000,
    date: "1403/01/15",
    status: "in_progress",
    category: "دیالیز",
    campaignTitle: "کمک به هزینه دیالیز حسین"
  },
  {
    id: 4,
    patientName: "زهرا احمدی",
    patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra",
    amount: 4500000,
    date: "1402/12/20",
    status: "completed",
    category: "پیوند کلیه",
    campaignTitle: "کمک به پیوند کلیه زهرا"
  },
  {
    id: 5,
    patientName: "رضا نوری",
    patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reza",
    amount: 1500000,
    date: "1402/11/10",
    status: "completed",
    category: "فیزیوتراپی",
    campaignTitle: "کمک به فیزیوتراپی رضا"
  }
];

export const mockReports = [
  {
    id: 1,
    donationId: 1,
    patientName: "محمد رضایی",
    reportDate: "1403/02/08",
    status: "عمل با موفقیت انجام شد",
    description: "بیمار تحت عمل جراحی قلب باز قرار گرفت. عمل با موفقیت انجام شد و بیمار در حال بهبودی است.",
    expenses: [
      { item: "هزینه جراحی", amount: 3000000 },
      { item: "هزینه بستری", amount: 1500000 },
      { item: "داروها", amount: 500000 }
    ],
    images: [
      "https://via.placeholder.com/400x300?text=گزارش+تصویری+1",
      "https://via.placeholder.com/400x300?text=گزارش+تصویری+2"
    ]
  },
  {
    id: 2,
    donationId: 2,
    patientName: "فاطمه کریمی",
    reportDate: "1403/02/01",
    status: "دوره شیمی‌درمانی در حال انجام",
    description: "بیمار دومین دوره شیمی‌درمانی را با موفقیت پشت سر گذاشت. وضعیت عمومی رو به بهبود است.",
    expenses: [
      { item: "داروهای شیمی‌درمانی", amount: 2500000 },
      { item: "آزمایشات", amount: 500000 }
    ],
    images: [
      "https://via.placeholder.com/400x300?text=گزارش+شیمی‌درمانی"
    ]
  }
];

export const mockReceipts = [
  {
    id: 1,
    receiptNumber: "REC-1403-001",
    donationId: 1,
    amount: 5000000,
    date: "1403/02/05",
    paymentMethod: "کارت به کارت",
    status: "تایید شده",
    downloadUrl: "#"
  },
  {
    id: 2,
    receiptNumber: "REC-1403-002",
    donationId: 2,
    amount: 3000000,
    date: "1403/01/28",
    paymentMethod: "درگاه بانکی",
    status: "تایید شده",
    downloadUrl: "#"
  },
  {
    id: 3,
    receiptNumber: "REC-1403-003",
    donationId: 3,
    amount: 2000000,
    date: "1403/01/15",
    paymentMethod: "کارت به کارت",
    status: "در انتظار تایید",
    downloadUrl: "#"
  },
  {
    id: 4,
    receiptNumber: "REC-1402-045",
    donationId: 4,
    amount: 4500000,
    date: "1402/12/20",
    paymentMethod: "درگاه بانکی",
    status: "تایید شده",
    downloadUrl: "#"
  }
];

export const mockFavoriteCampaigns = [
  {
    id: 1,
    title: "کمک به عمل جراحی قلب کودکان",
    description: "کمک به کودکان نیازمند برای انجام عمل جراحی قلب",
    image: "https://via.placeholder.com/400x300?text=کمپین+قلب",
    raised: 45000000,
    goal: 60000000,
    progress: 75,
    daysLeft: 15,
    supporters: 234,
    isFavorite: true
  },
  {
    id: 2,
    title: "کمک به بیماران سرطانی",
    description: "تامین هزینه شیمی‌درمانی بیماران سرطانی",
    image: "https://via.placeholder.com/400x300?text=کمپین+سرطان",
    raised: 30000000,
    goal: 50000000,
    progress: 60,
    daysLeft: 22,
    supporters: 156,
    isFavorite: true
  },
  {
    id: 3,
    title: "کمک به دیالیز بیماران کلیوی",
    description: "تامین هزینه دیالیز برای بیماران نیازمند",
    image: "https://via.placeholder.com/400x300?text=کمپین+دیالیز",
    raised: 20000000,
    goal: 40000000,
    progress: 50,
    daysLeft: 30,
    supporters: 98,
    isFavorite: true
  }
];
