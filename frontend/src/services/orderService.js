import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/orders`;

export const getMyOrders = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getBuyerOrders = (token) =>
  axios.get(`${API}/buyer`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const createOrder = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateOrderStatus = (id, status, token) =>
  axios.patch(
    `${API}/${id}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const getOrderById = (id, token) =>
  axios.get(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });