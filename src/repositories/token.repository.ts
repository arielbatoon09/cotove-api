import { db } from '@/config/database';
import { tokens } from '@/database/schema/token.schema';
import { eq, and } from 'drizzle-orm';
import { TokenModel, TokenType } from '@/models/token-model';

export class TokenRepository {
  async findByToken(token: string): Promise<TokenModel | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: eq(tokens.token, token)
    });
    
    if (!tokenRecord) return null;
    
    return TokenModel.fromDB(tokenRecord);
  }
  
  async findByUserIdAndType(userId: string, type: TokenType): Promise<TokenModel[]> {
    const tokenRecords = await db.query.tokens.findMany({
      where: and(
        eq(tokens.userId, userId),
        eq(tokens.type, type)
      )
    });
    
    return tokenRecords.map(record => TokenModel.fromDB(record));
  }
  
  async create(tokenData: {
    userId: string;
    token: string;
    type: TokenType;
    expiresAt: Date;
    blacklisted: boolean;
  }): Promise<TokenModel> {
    const result = await db.insert(tokens).values({
      userId: tokenData.userId,
      token: tokenData.token,
      type: tokenData.type,
      expiresAt: tokenData.expiresAt,
      blacklisted: tokenData.blacklisted
    }).returning();
    
    return TokenModel.fromDB(result[0]);
  }
  
  async update(id: string, tokenData: Partial<{
    blacklisted: boolean;
    expiresAt: Date;
  }>): Promise<TokenModel> {
    const result = await db.update(tokens)
      .set({
        blacklisted: tokenData.blacklisted,
        expiresAt: tokenData.expiresAt
      })
      .where(eq(tokens.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Token not found');
    }
    
    return TokenModel.fromDB(result[0]);
  }
  
  async deleteByUserIdAndType(userId: string, type: TokenType): Promise<void> {
    await db.delete(tokens)
      .where(and(
        eq(tokens.userId, userId),
        eq(tokens.type, type)
      ));
  }

  async findByTokenAndUserId(token: string, userId: string): Promise<TokenModel | null> {
    const tokenRecord = await db.query.tokens.findFirst({
      where: and(
        eq(tokens.token, token),
        eq(tokens.userId, userId)
      )
    });
    
    if (!tokenRecord) return null;
    
    return TokenModel.fromDB(tokenRecord);
  }

  async findByUserId(userId: string): Promise<TokenModel[]> {
    const tokenRecords = await db.query.tokens.findMany({
      where: eq(tokens.userId, userId)
    });
    
    return tokenRecords.map(record => TokenModel.fromDB(record));
  }
} 