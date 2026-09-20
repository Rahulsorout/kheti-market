export const maskId = (id) => {
  if (!id) return null;
  const s = id.toString();
  if (s.length <= 8) return "***";
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
};
