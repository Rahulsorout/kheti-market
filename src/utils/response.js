export const success = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      requestId: res.req.requestId,
      timestamp: new Date().toISOString()
    }
  });
};

export const failure = (res, { code, message, details }, status = 500) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: details || null
    },
    meta: {
      requestId: res.req.requestId
    }
  });
};
