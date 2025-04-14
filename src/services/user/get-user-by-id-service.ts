import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { UserModel } from '@/models/user-model';
import { ApiError } from '@/utils/api-error';

export const getUserById = async (userId: string): Promise<UserModel | null> => {
  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return UserModel.fromDB(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new ApiError(500, 'Failed to get user');
  }
}; 