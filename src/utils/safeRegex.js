export const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildSafeRegex = (str) =>
  new RegExp(escapeRegex(str), "i");
