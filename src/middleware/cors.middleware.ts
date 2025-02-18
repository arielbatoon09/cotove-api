import { CorsOptions } from "cors";
import prisma from "@/lib/prisma";
import logger from "@/utils/Logger";

// Manual CORS Configuration
export const manualCorsOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];

// Validate origin format
const isValidOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Extract domain from origin
const extractDomain = (origin: string): string => {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return "";
  }
}

export const corsOptions: CorsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600,
  origin: async(origin, callback) => {

    if (process.env.NODE_ENV !== 'production' && !origin) {
      logger.info("[CORS] Allowing request with no origin in development environment.");
      return callback(null, true);
    }

    try {
      // Validate origin format
      if (origin && !isValidOrigin(origin)) {
        logger.warn(`[CORS] Invalid origin format: ${origin}`);
        return callback(new Error('Invalid origin format'), false);
      }

      // Origin is being manually configured
      if (origin && manualCorsOrigins.includes(origin)) {
        logger.info(`[CORS] Allowing manually configured origin: ${origin}`);
        return callback(null, true);
      }

      // Extract domain from origin
      const hostname = extractDomain(origin ? origin : "");
      if (!hostname) {
        logger.warn(`[CORS] Could not extract hostname from origin: ${origin}`);
        return callback(new Error("Invalid origin"), false);
      }

      // // Query the database for matching store
      const store = await prisma.store.findFirst({
        where: {
          OR: [
            { subdomain: hostname },
            { domain: hostname }
          ],
          status: "active"
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
        }
      });

      if (store) {
        logger.success(`[CORS] Allowing store domain: ${hostname} (Store: ${store.name})`);
        return callback(null, true);
      }

      logger.warn(`[CORS] Rejected unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    } catch (error) {
      logger.error(`[CORS] Validation error: ${error}`);
      callback(new Error("CORS validation failed"));
    }
  }
}