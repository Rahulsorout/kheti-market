export const markDeprecated = (sunsetDate) => {
  return (req, res, next) => {
    res.setHeader("Deprecation", "true");
    res.setHeader("Sunset", sunsetDate);
    next();
  };
};
