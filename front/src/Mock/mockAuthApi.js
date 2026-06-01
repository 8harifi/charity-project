export const mockAuthApi = {
  login: async ({ username, password }) => {
    if (
      (username === "09123456789" || username === "doctor") &&
      password === "12345678"
    ) {
      return {
        data: {
          access: "mock-access-token",
          refresh: "mock-refresh-token",
        },
      };
    }
    const err = new Error("نام کاربری یا رمز عبور اشتباه است");
    err.response = { data: { detail: err.message } };
    throw err;
  },

  logout: async () => true,
};
