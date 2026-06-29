import api from "./api";

// ─── AI Service ───────────────────────────────────────────────────────────────
const aiService = {
  /**
   * Fetch AI-generated dashboard summary.
   * GET /ai/dashboard
   * @returns {Promise<AxiosResponse>}
   */
  getDashboard: async () => {
    const response = await api.get("/ai/dashboard");
    return response;
  },

  /**
   * Fetch AI coach insights and advice.
   * GET /ai/coach
   * @returns {Promise<AxiosResponse>}
   */
  getCoach: async () => {
    const response = await api.get("/ai/coach");
    return response;
  },

  /**
   * Fetch AI-ranked task priorities.
   * GET /ai/priorities
   * @returns {Promise<AxiosResponse>}
   */
  getPriorities: async () => {
    const response = await api.get("/ai/priorities");
    return response;
  },

  /**
   * Fetch AI productivity analysis.
   * GET /ai/analyze
   * @returns {Promise<AxiosResponse>}
   */
  analyze: async () => {
    const response = await api.get("/ai/analyze");
    return response;
  },

  /**
   * Generate an AI task plan from a prompt.
   * POST /ai/plan
   * @param {string} prompt - Natural language planning prompt
   * @returns {Promise<AxiosResponse>}
   */
  planner: async (prompt) => {
    const response = await api.post("/ai/plan", { prompt });
    return response;
  },

  /**
   * Generate an AI schedule from task data.
   * POST /ai/schedule
   * @param {Object} data - Task or context data to schedule
   * @returns {Promise<AxiosResponse>}
   */
  schedule: async (data) => {
    const response = await api.post("/ai/schedule", data);
    return response;
  },

  /**
   * Send a message to the AI chat assistant.
   * POST /ai/chat
   * @param {string} message - User message string
   * @returns {Promise<AxiosResponse>}
   */
  chat: async (message) => {
    const response = await api.post("/ai/chat", { message });
    return response;
  },
};

export default aiService;