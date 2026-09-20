import axios from "axios";
import { API_URL } from "../config/api";

const AUTH_API = `${API_URL}/auth`;

export const registerUser = async (userData) => {
  const response = await axios.post(`${AUTH_API}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${AUTH_API}/login`, userData);
  return response.data;
};