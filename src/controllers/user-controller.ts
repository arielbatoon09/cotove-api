import type { Request, Response } from "express";
import userService from "@/services/user";

export async function handleCreateUser(req: Request, res: Response) {
  const user = await userService.addUser();
  res.status(200).json({
    message: user,
  });
}