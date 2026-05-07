// src/Mock/mockDoctorDashboardApi.js

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockDoctorDashboardApi = {
  // ✅ STEP 1 - ثبت اطلاعات اولیه
  submitStep1: async (payload) => {
    await delay();

    console.log("✅ MOCK submitStep1:", payload);

    return {
      data: {
        success: true,
        message: "مرحله اول با موفقیت ثبت شد",
        doctor_id: 101,
      },
    };
  },

  // ✅ STEP 2 - تکمیل ثبت‌نام
  submitStep2: async (payload) => {
    await delay();

    console.log("✅ MOCK submitStep2:", payload);

    return {
      data: {
        success: true,
        message: "ثبت‌نام کامل شد ✅",
      },
    };
  },

  // ✅ پروفایل پزشک
  getProfile: async () => {
    await delay();

    return {
      data: {
        name: "سجاد رضایی",
        memberSince: "1402/05/12",
        newCounselings: 6,
        doneCounselings: 89,
        patients: 12,
        phoneNumber: "0939-346-8756",
        speciality: "داخلی",
        services: "پزشکی، جراحی",
        avatar: "/api/placeholder/120/120",
      },
    };
  },

  // ✅ لیست مشاوره‌ها
  getCounselings: async () => {
    await delay();

    return {
      data: [
        {
          id: 1,
          patient: "علی احمدی",
          date: "1403/02/20",
          status: "در انتظار پاسخ",
        },
        {
          id: 2,
          patient: "مریم حسینی",
          date: "1403/02/18",
          status: "انجام شده",
        },
      ],
    };
  },

  // ✅ لیست نوبت‌ها
  getAppointments: async () => {
    await delay();

    return {
      data: [
        {
          id: 1,
          patient: "محمد رضایی",
          date: "1403/02/22",
          time: "10:30",
          type: "آنلاین",
        },
        {
          id: 2,
          patient: "زهرا کریمی",
          date: "1403/02/23",
          time: "14:00",
          type: "حضوری",
        },
      ],
    };
  },
};
