import axios from "axios";

const API =
  "http://localhost:5000/api/v1/contracts";


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