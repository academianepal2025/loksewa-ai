import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Sending test email via loksewaai.com...');
    const data = await resend.emails.send({
      from: 'Loksewa AI <notifications@loksewaai.com>',
      to: 'loksewagkdose@gmail.com',
      subject: 'Test - Payment Notification System',
      html: '<h2>It works!</h2><p>If you see this, the payment notification emails are now functional.</p>'
    });
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
