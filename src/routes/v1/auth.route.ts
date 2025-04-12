import type { Router } from "express";
import { handleCreateUser, handleLogin } from "@/controllers/user-controller";
import { createRouter } from "@/utils/create-handler";

export default createRouter((router: Router) => {
  router.post('/signup', handleCreateUser);
  router.post('/login', handleLogin);
});