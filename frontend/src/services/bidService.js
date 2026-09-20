import axios from "axios";

const API = "http://localhost:5000/api/v1";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Buyer
export const createBid = (listingId, data, token) =>
  axios.post(
    `${API}/listings/${listingId}/bids`,
    data,
    authConfig(token)
  );

// Farmer
export const getBidsForListing = (listingId, token) =>
  axios.get(
    `${API}/listings/${listingId}/bids`,
    authConfig(token)
  );

// Farmer
export const acceptBid = (bidId, token) =>
  axios.post(
    `${API}/bids/${bidId}/accept`,
    {},
    authConfig(token)
  );

// Farmer
export const rejectBid = (bidId, token) =>
  axios.post(
    `${API}/bids/${bidId}/reject`,
    {},
    authConfig(token)
  );

// Farmer
export const counterBid = (bidId, data, token) =>
  axios.post(
    `${API}/bids/${bidId}/counter`,
    data,
    authConfig(token)
  );