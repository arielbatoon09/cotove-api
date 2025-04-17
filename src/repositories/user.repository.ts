import { db } from '@/config/database';
import { users } from '@/database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { DBUser, CreateUserInput } from '@/models/user-model';

export class UserRepository {
  async findByEmail(email: string): Promise<DBUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return user ?? null;
  }
  
  async findById(id: string): Promise<DBUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return user ?? null;
  }
  
  async create(userData: CreateUserInput): Promise<DBUser> {
    const result = await db.insert(users).values({
      email: userData.email,
      password: userData.password,
      name: userData.name ?? '',
      isActive: userData.isActive ?? true,
      lastLogin: null,
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return result[0];
  }
  
  async update(id: string, userData: Partial<CreateUserInput>): Promise<DBUser> {
    const updateFields: Partial<DBUser> = {
      updatedAt: new Date()
    };
    
    if (userData.email) updateFields.email = userData.email;
    if (userData.password) updateFields.password = userData.password;
    if (userData.name !== undefined) updateFields.name = userData.name ?? '';
    if (userData.isActive !== undefined) updateFields.isActive = userData.isActive;
    
    const result = await db.update(users)
      .set(updateFields)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }
} 