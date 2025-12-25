import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Run raw SQL to add columns
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT,
      ADD COLUMN IF NOT EXISTS "emailVerificationExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT,
      ADD COLUMN IF NOT EXISTS "passwordResetExpiry" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "welcomeEmailSent" BOOLEAN NOT NULL DEFAULT false;
    `;
    
    console.log('✅ Columns added successfully');
    
    // Add unique constraints (skip if already exists)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_emailVerificationToken_key" 
        UNIQUE ("emailVerificationToken");
      `;
      console.log('✅ Email verification token constraint added');
    } catch (error: any) {
      if (error.code === 'P2010' && error.meta?.message?.includes('already exists')) {
        console.log('ℹ️  Email verification token constraint already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_passwordResetToken_key" 
        UNIQUE ("passwordResetToken");
      `;
      console.log('✅ Password reset token constraint added');
    } catch (error: any) {
      if (error.code === 'P2010' && error.meta?.message?.includes('already exists')) {
        console.log('ℹ️  Password reset token constraint already exists');
      } else {
        throw error;
      }
    }
    
    // Add indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_emailVerificationToken_idx" 
      ON "User"("emailVerificationToken");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_passwordResetToken_idx" 
      ON "User"("passwordResetToken");
    `;
    
    console.log('✅ Indexes created');
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
