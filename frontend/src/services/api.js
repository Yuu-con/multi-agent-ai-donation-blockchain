import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 15000,
});

export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    return typeof error.response.data.detail === "string"
      ? error.response.data.detail
      : JSON.stringify(error.response.data.detail);
  }
  if (error.code === "ERR_NETWORK") {
    return "Không kết nối được backend. Hãy kiểm tra FastAPI đã chạy chưa.";
  }
  return error.message || "Có lỗi xảy ra.";
}

export default api;
