import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/listings`;

export const getAllProducts = (filters = {}) => {
  return axios.get(API, {
    params: filters
  });
};

export const getProductById = (id) => {
  return axios.get(`${API}/${id}`);
};

export const createProduct = (data, token) => {
  return axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteProduct = (id, token) => {
  return axios.delete(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};