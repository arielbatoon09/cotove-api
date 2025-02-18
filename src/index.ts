import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import routes from "@/routes";
import Logger from "@/utils/Logger";
import { GlobalLimiter } from "@/middleware/ratelimit.middleware";
import { securityHeaders, preventPollution, validateRequestBody} from "./middleware/security.middleware";
import { corsOptions } from "./middleware/cors.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT;
const endpoint = process.env.BACKEND;

// Global middleware
const globalMiddleware = [
  securityHeaders,
  preventPollution,
  cors(corsOptions),
  express.json({ limit: '10kb' }),
  validateRequestBody,
  GlobalLimiter,
];
// Apply global middleware
globalMiddleware.forEach(middleware => app.use(middleware));

// IP Rate Limit
app.use(GlobalLimiter);

// Router V1
app.use("/api/v1", routes);

// Not found handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(port, () => {
  Logger.info(`Server running on ${endpoint}:${port}.`)
});