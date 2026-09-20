import axios from "axios";

import { API_URL } from "../config/api";

const API = `${API_URL}/contracts`;


// Get contract messages

export const getMessages = (
  contractId,
  token
) =>
  axios.get(
    `${API}/${contractId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );


// Send message

export const sendMessage = (
  contractId,
  message,
  token
) =>
  axios.post(
    `${API}/${contractId}/messages`,
    {
      message
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );