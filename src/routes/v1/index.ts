import type { Router } from "express";
import { createRouter } from "@/utils/create-handler";
import authRoute from "./auth.route";
import storeRoute from "./store.route";
export default createRouter((router: Router) => {
  router.use('/auth', authRoute);
  router.use('/store', storeRoute);
});
