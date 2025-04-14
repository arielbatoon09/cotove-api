import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { UserModel } from '@/models/user-model';

export class UserRepository {
  async findByEmail(email: string): Promise<UserModel | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (!user) return null;
    
    return UserModel.fromDB(user);
  }
  
  async findById(id: string): Promise<UserModel | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    
    if (!user) return null;
    
    return UserModel.fromDB(user);
  }
  
  async create(userData: {
    email: string;
    password: string;
    name: string;
    is_active: boolean;
  }): Promise<UserModel> {
    const result = await db.insert(users).values(userData).returning();
    return UserModel.fromDB(result[0]);
  }
  
  async update(id: string, userData: Partial<{
    email: string;
    password: string;
    name: string;
    is_active: boolean;
  }>): Promise<UserModel> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return UserModel.fromDB(result[0]);
  }
} 