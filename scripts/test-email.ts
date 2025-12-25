// Test Resend Email Script
// Run with: npx tsx scripts/test-email.ts

import { Resend } from 'resend';

async function testEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  // Test with any email - your domain is now verified!
  const toEmail = 'test@example.com'; // Change this to any email you want to test
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('📧 Testing Resend email...');
  console.log(`From: ${fromEmail}`);
  console.log(`To: ${toEmail}`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Test Email from ApniSec',
      html: '<h1>Test Email</h1><p>If you see this, email is working!</p>',
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('\n❌ Failed to send email:');
    console.error('Error:', error.message || error);
    
    if (error.statusCode === 403) {
      console.log('\n⚠️  This error means:');
      console.log('   - onboarding@resend.dev can only send to YOUR verified email');
      console.log('   - Add your own domain in Resend dashboard to send to any email');
    }
  }
}

// Load .env
import 'dotenv/config';
testEmail();
