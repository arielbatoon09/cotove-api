import { db } from '@/config/database';
import { tokens } from '@/database/schema/token.schema';
import { eq, and } from 'drizzle-orm';
import { DBToken, TokenType, CreateTokenInput } from '@/models/token-model';

export class TokenRepository {
  async findByToken(token: string): Promise<DBToken | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: eq(tokens.token, token)
    });
    return tokenRecord ?? null;
  }
  
  async findByUserIdAndType(userId: string, type: TokenType): Promise<DBToken[]> {
    return db.query.tokens.findMany({
      where: and(
        eq(tokens.userId, userId),
        eq(tokens.type, type)
      )
    });
  }
  
  async create(tokenData: CreateTokenInput): Promise<DBToken> {
    const result = await db.insert(tokens).values({
      userId: tokenData.userId,
      token: tokenData.token,
      type: tokenData.type,
      expiresAt: tokenData.expiresAt,
      blacklisted: tokenData.blacklisted ?? false
    }).returning();
    
    return result[0];
  }
  
  async update(id: string, tokenData: Partial<CreateTokenInput>): Promise<DBToken> {
    const result = await db.update(tokens)
      .set({
        ...tokenData,
        updatedAt: new Date()
      })
      .where(eq(tokens.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteByUserIdAndType(userId: string, type: TokenType): Promise<void> {
    await db.delete(tokens)
      .where(and(
        eq(tokens.userId, userId),
        eq(tokens.type, type)
      ));
  }

  async findByTokenAndUserId(token: string, userId: string): Promise<DBToken | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: and(
        eq(tokens.token, token),
        eq(tokens.userId, userId)
      )
    });
    return tokenRecord ?? null;
  }

  async findByUserId(userId: string): Promise<DBToken[]> {
    return db.query.tokens.findMany({
      where: eq(tokens.userId, userId)
    });
  }
} 