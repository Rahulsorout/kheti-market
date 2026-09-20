import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/payments`;

export const createPayment = (data, token) =>
  axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getPaymentByOrder = (orderId, token) =>
  axios.get(`${API}/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const markPaymentAsPaid = (
  paymentId,
  token
) =>
  axios.patch(
    `${API}/${paymentId}/pay`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );