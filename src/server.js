import express from "express";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";
import swaggerSpec from "./swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import v1Routes from "./routes/v1/index.js";
import { markDeprecated } from "./middleware/deprication.js";
import { requestContext } from "./middleware/requestContext.js";
import { initSocket } from "./socket.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(requestContext);

app.use(
  "/api",
  rateLimit({
    limit: 100,
    windowMs: 60 * 1000,
  })
);

app.use(
  "/api/v1",
  markDeprecated("2026-12-31"),
  v1Routes
);

app.get("/api/test", (req, res) => {
  res.send("API is working!");
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

const server = http.createServer(app);

// Initialize Socket.IO ONCE
initSocket(server);

app.use(errorHandler);

connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});