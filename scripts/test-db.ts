// Database Connection Test Script
// Run with: npx ts-node --esm scripts/test-db.ts

import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Query result:', result);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);
    
    // Count issues
    const issueCount = await prisma.issue.count();
    console.log(`✅ Issue count: ${issueCount}`);
    
    // Check RateLimitRecord table
    const rateLimitCount = await prisma.rateLimitRecord.count();
    console.log(`✅ Rate limit records: ${rateLimitCount}`);
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
