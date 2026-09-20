import axios from "axios";

const API =
  "http://localhost:5000/api/v1/shipments";

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