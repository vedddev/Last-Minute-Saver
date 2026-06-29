import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("athena_token");

    console.log("========== API REQUEST ==========");
    console.log("URL:", config.url);
    console.log("Token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Headers:", config.headers);
    console.log("=================================");

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("========== API ERROR ==========");
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("===============================");

    if (error.response?.status === 401) {
      localStorage.removeItem("athena_token");
      localStorage.removeItem("athena_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;