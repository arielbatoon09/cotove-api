import type { Router } from "express";
import { createRouter } from "@/utils/create-handler";
import { storeController } from "@/controllers/store.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

export default createRouter((router: Router) => {
    router.post('/new-store', authMiddleware, storeController.createStore);
});