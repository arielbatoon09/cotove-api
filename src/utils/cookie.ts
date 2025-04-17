import { Response } from 'express';

interface CookieOptions {
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const setHttpOnlyCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    domain: process.env.NODE_ENV === 'production' 
      ? process.env.COOKIE_DOMAIN 
      : 'localhost'
  };

  res.cookie(name, value, {
    ...defaultOptions,
    ...options
  });
};

export const clearCookie = (
  res: Response,
  name: string,
  options: CookieOptions = {}
): void => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    domain: process.env.NODE_ENV === 'production' 
      ? process.env.COOKIE_DOMAIN 
      : 'localhost'
  };

  res.clearCookie(name, {
    ...defaultOptions,
    ...options
  });
}; 