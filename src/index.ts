import express from "express";
import dotenv from "dotenv";
import routes from "@/routes";
import Logger from "@/utils/Logger";
import { GlobalLimiter } from "@/middleware/ratelimit.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT;
const endpoint = process.env.BACKEND;

app.use(express.json());

// IP Rate Limit
app.use(GlobalLimiter);

// Router V1
app.use("/api/v1", routes);

app.listen(port, () => {
  Logger.info(`Server running on ${endpoint}:${port}.`)
});