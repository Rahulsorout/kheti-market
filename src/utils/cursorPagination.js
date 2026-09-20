import mongoose from "mongoose";

// Encode cursor
export const encodeCursor = (doc) => {
  return Buffer.from(
    JSON.stringify({
      id: doc._id.toString(),
      createdAt: doc.createdAt
    })
  ).toString("base64");
};

// Decode cursor
export const decodeCursor = (cursor) => {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf-8")
    );
    return decoded;
  } catch {
    return null;
  }
};

// Apply cursor filter to query
export const applyCursor = (query, cursorObj) => {
  if (!cursorObj) return query;

  const { id, createdAt } = cursorObj;

  return query.where({
    $or: [
      { createdAt: { $lt: new Date(createdAt) } },
      {
        createdAt: new Date(createdAt),
        _id: { $lt: new mongoose.Types.ObjectId(id) }
      }
    ]
  });
};
