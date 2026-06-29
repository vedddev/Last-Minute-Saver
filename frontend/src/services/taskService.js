import api from "./api";

const taskService = {
  // Get all tasks
  getTasks() {
    return api.get("/tasks/");
  },

  // Add task
  addTask(task) {
    return api.post("/tasks/add", task);
  },

  // Update task
  updateTask(id, task) {
    return api.put(`/tasks/${id}`, task);
  },

  // Delete task
  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },
};

export default taskService;