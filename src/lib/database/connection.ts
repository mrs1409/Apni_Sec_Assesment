import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * DatabaseConnection - Singleton class for managing Prisma client connection
 * Uses lazy initialization to avoid issues during build time
 */
class DatabaseConnection {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of PrismaClient
   * Creates the instance lazily on first access
   */
  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = global.prisma || new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      if (process.env.NODE_ENV !== 'production') {
        global.prisma = DatabaseConnection.instance;
      }
    }
    return DatabaseConnection.instance;
  }

  /**
   * Disconnect from the database
   */
  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
      DatabaseConnection.instance = null;
    }
  }
}

/**
 * Get the Prisma client instance
 * This function provides lazy initialization to avoid build-time errors
 */
const getPrisma = (): PrismaClient => {
  return DatabaseConnection.getInstance();
};

// Export a proxy that lazily initializes Prisma
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export { DatabaseConnection, getPrisma };
