import { NextRequest } from 'next/server';
import { AuthHandler } from '@/lib/handlers';

const authHandler = new AuthHandler();

export async function GET(request: NextRequest) {
  return authHandler.verifyEmail(request);
}
