import { addUser } from "./add-user-service";
import { getUserByEmail } from "./get-user-by-email-service";

const userService = {
  addUser,
  getUserByEmail,
};

export default userService;