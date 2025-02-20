export interface IRedisClient {
  set(key: string, value: any, expiresIn?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  listPush(key: string, value: any): Promise<void>;
  listGet<T>(key: string): Promise<T[]>;
  hashSet(key: string, field: string, value: any): Promise<void>;
  hashGet<T>(key: string, field: string): Promise<T | null>;
  hashGetAll<T>(key: string): Promise<Record<string, T>>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  clearAll(): Promise<void>;
  disconnect(): Promise<void>;
}