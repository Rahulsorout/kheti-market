import axios from "axios";

const API = "http://localhost:5000/api/v1/listings";

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