export const mockPatient = {
  id: 501,
  full_name: "حسین احمدی",
  gender: "مرد",
  national_id: "1234567890",
  phone_number: "09123456789",
  age: 32,
  role: "patient",
  token: "mock-patient-token-123456",

  login: async ({ userName, phone_number, password }) => {
    await new Promise(r => setTimeout(r, 500));

    // فرض کن userName یا phone_number و password باید خاص باشه
    if (
      (userName === "patient" || phone_number === "09123456789") &&
      password === "12345678"
    ) {
      return {
        user: {
          id: 501,
          full_name: "حسین احمدی",
          gender: "مرد",
          national_id: "1234567890",
          phone_number: "09123456789",
          age: 32,
          role: "patient",
        },
        token: "mock-patient-token-123456",
      };
    } else {
      throw new Error("نام کاربری، شماره موبایل یا رمز عبور اشتباه است");
    }
  },
};
