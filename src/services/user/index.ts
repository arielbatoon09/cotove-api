import { addUser } from "./add-user-service";
import { getUserByEmail } from "./get-user-by-email-service";
import { getUserById } from "./get-user-by-id-service";

const userService = {
  addUser,
  getUserByEmail,
  getUserById,
};

export default userService;