import axios from "axios";

const API =
  "http://localhost:5000/api/v1/payments";

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