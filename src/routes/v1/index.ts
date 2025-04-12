import type { Router } from "express";
import { createRouter } from "@/utils/create-handler";
import authRoute from "./auth.route";

export default createRouter((router: Router) => {
  router.use('/auth', authRoute);
});
