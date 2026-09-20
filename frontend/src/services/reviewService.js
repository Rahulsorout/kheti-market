import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/reviews`;


// Create review
export const createReview = (
  data,
  token
) =>
  axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });


// Get reviews for farmer
export const getFarmerReviews = (
  farmerId,
  token
) =>
  axios.get(
    `${API}/farmer/${farmerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );


// Get review for order
export const getOrderReview = (
  orderId,
  token
) =>
  axios.get(
    `${API}/order/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );