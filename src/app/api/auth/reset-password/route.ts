import { NextRequest } from 'next/server';
import { AuthHandler } from '@/lib/handlers';

const authHandler = new AuthHandler();

export async function POST(request: NextRequest) {
  return authHandler.resetPassword(request);
}
