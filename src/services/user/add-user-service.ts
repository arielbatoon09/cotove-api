import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { UserModel, CreateUserInput } from '@/models/user-model';
import { hashPassword } from '@/utils/hash';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function addUser(userData: CreateUserInput, tx?: NodePgDatabase) {
  try {
    const user = new UserModel(userData);
    const hashedPassword = await hashPassword(user.password);
    
    const userWithHashedPassword = {
      ...user.toJSON(),
      password: hashedPassword,
    };
    
    const dbClient = tx || db;
    
    // Insert the user into the database
    const [newUser] = await dbClient.insert(users)
      .values(userWithHashedPassword)
      .returning();
    
    const createdUser = UserModel.fromDB(newUser);
    return createdUser.toSafeJSON();
  } catch (error) {
    throw error;
  }
}