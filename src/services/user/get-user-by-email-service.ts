import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { UserModel } from '@/models/user-model';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user) {
      return null;
    }
    
    return UserModel.fromDB(user);
  } catch (error) {
    throw error;
  }
}