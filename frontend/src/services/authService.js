import api from "./api";

const TOKEN_KEY = "athena_token";
const USER_KEY = "athena_user";

const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
    }

    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  async register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  },

  async getProfile() {
    const response = await api.get("/auth/profile");

    if (response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
};

export default authService;