// src/Services/authService.js

import { USE_MOCK_API } from "../Configs/apiConfig";
import { mockAuthApi } from "../Mock/mockAuthApi";
import { authApi } from "../API/authApi";

export const authService = USE_MOCK_API
  ? mockAuthApi
  : authApi;
