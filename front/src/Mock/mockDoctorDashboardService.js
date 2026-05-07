// /src/Mock/mockDoctorDashboardService.js

const USERS_KEY = "mock_users";

// -------------------- Helpers --------------------

function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

function updateUser(updatedUser) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === updatedUser.id);
  if (idx !== -1) {
    users[idx] = updatedUser;
    saveUsers(users);
  }
}

function findUserByPhone(phone) {
  const users = getUsers();
  return users.find(u => u.phone_number === phone);
}

function findUser(phone, password) {
  const users = getUsers();
  return users.find(
    u => u.phone_number === phone && u.password === password
  );
}

// -------------------- Mock Service --------------------

export const mockDoctorDashboardService = {

  // ---------- ثبت‌نام مرحله اول ----------
  submitStep1: async (data) => {
    if (findUserByPhone(data.phone_number)) {
      throw new Error("این شماره تلفن قبلاً ثبت شده است.");
    }

    const newDoctor = {
      id: Date.now(),
      userType: "doctor",             // ⭐ مهم برای Redirect
      full_name: data.full_name,
      phone_number: data.phone_number,
      password: data.password,        // در Mock اشکالی ندارد، رمز ساده
      speciality: data.speciality,
      national_code: data.national_code || "", // برای سازگاری با API اصلی
      services: [],
      collaborations: [],
      signupCompleted: false,
      memberSince: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addUser(newDoctor);

    localStorage.setItem("token", newDoctor.id.toString());

    return { data: newDoctor };
  },

  // ---------- ثبت‌نام مرحله دوم ----------
  submitStep2: async (data) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("ابتدا وارد شوید.");

    const users = getUsers();
    const doctorIndex = users.findIndex(u => u.id.toString() === token);

    if (doctorIndex === -1) {
      throw new Error("Doctor not found");
    }

    const oldDoctor = users[doctorIndex];

    const updatedDoctor = {
      ...oldDoctor,
      services: data.services || oldDoctor.services,
      collaborations: data.collaborations || oldDoctor.collaborations,
      signupCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    users[doctorIndex] = updatedDoctor;
    saveUsers(users);

    return { data: updatedDoctor };
  },

  // ---------- لاگین ----------
  login: async ({ phone_number, password }) => {
    const user = findUser(phone_number, password);

    if (!user) {
      throw new Error("شماره تلفن یا رمز عبور اشتباه است");
    }

    localStorage.setItem("token", user.id.toString());

    return { data: user };
  },

  // ---------- دریافت پروفایل ----------
  getProfile: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("کاربر وارد نشده است.");

    const users = getUsers();
    const doctor = users.find(u => u.id.toString() === token);

    if (!doctor) throw new Error("Doctor not found");

    return {
      data: {
        id: doctor.id,
        name: doctor.full_name,
        userType: doctor.userType,
        phoneNumber: doctor.phone_number,
        speciality: doctor.speciality,
        nationalCode: doctor.national_code || "",
        services: doctor.services,
        collaborations: doctor.collaborations,
        signupCompleted: doctor.signupCompleted,
        memberSince: doctor.memberSince,
      },
    };
  },

  // ---------- خروج ----------
  logout: async () => {
    localStorage.removeItem("token");
  },
};
