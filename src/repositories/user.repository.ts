import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { UserModel, CreateUserInput } from '@/models/user-model';

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
  
  async create(userData: CreateUserInput): Promise<UserModel> {
    const user = new UserModel(userData);
    
    const result = await db.insert(users).values(user.toDB()).returning();
    return UserModel.fromDB(result[0]);
  }
  
  async update(id: string, userData: Partial<{
    email: string;
    password: string;
    name: string;
    isActive: boolean;
    lastLogin: Date;
    verifiedAt: Date;
  }>): Promise<UserModel> {
    const currentUser = await this.findById(id);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Update the model with new data
    Object.assign(currentUser, {
      email: userData.email ?? currentUser.email,
      password: userData.password ?? currentUser.password,
      name: userData.name ?? currentUser.name,
      isActive: userData.isActive ?? currentUser.isActive,
      lastLogin: userData.lastLogin ?? currentUser.lastLogin,
      verifiedAt: userData.verifiedAt ?? currentUser.verifiedAt
    });

    const result = await db.update(users)
      .set(currentUser.toDB())
      .where(eq(users.id, id))
      .returning();
    
    return UserModel.fromDB(result[0]);
  }
} 