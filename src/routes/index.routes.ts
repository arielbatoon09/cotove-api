import express from "express";
import { AuthController } from "@/controllers/auth.controller";

const router = express.Router();

// Authentication
router.post('/auth/signup', AuthController.signup);

export default router;