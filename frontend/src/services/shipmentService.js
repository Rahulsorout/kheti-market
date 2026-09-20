import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/shipments`;

export const createShipment = (
  data,
  token
) =>
  axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getShipmentByOrder = (
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

export const updateShipmentStatus = (
  shipmentId,
  status,
  token
) =>
  axios.patch(
    `${API}/${shipmentId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );