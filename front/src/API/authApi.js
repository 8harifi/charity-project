import axios from "axios";
import { API_BASE_URL } from "../Configs/apiBase";

export const authApi = {
  login: (credentials) => axios.post(`${API_BASE_URL}/sign-in/`, credentials),
};
