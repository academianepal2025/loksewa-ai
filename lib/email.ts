import { Resend } from 'resend';
import { getPaymentApprovedTemplate, getAdminPaymentAlertTemplate, getPaymentRejectedTemplate } from './email-templates';

// Initialize Resend if key exists, otherwise provide a mock for development
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The "from" email address (must be a verified domain in Resend)
const FROM_EMAIL = 'notifications@loksewaai.com'; // Must match the verified domain in Resend

// The admin email address
export const ADMIN_EMAIL = 'loksewagkdose@gmail.com'; // Adjust if different

export async function sendPaymentAlertEmail(paymentDetails: {
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  paymentMethod: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Payment alert email not sent.', paymentDetails);
    return;
  }

  try {
    const htmlContent = getAdminPaymentAlertTemplate(paymentDetails);
    await resend.emails.send({
      from: `Loksewa AI <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🚨 New Payment Request: ${paymentDetails.plan.toUpperCase()}`,
      html: htmlContent,
    });
    console.log('Payment alert email sent successfully.');
  } catch (error) {
    console.error('Failed to send payment alert email:', error);
  }
}

export async function sendWeeklyReportEmail(metrics: any) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Weekly report email not sent.');
    return;
  }

  try {
    await resend.emails.send({
      from: `Loksewa AI <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `📊 Loksewa AI: Weekly Metrics Report`,
      html: `
        <h2>Weekly Metrics Report</h2>
        <p>Here is your summary for the past 7 days:</p>
        <ul>
          <li><strong>New Signups:</strong> ${metrics.newSignups}</li>
          <li><strong>Active Users (DAU Avg):</strong> ${metrics.avgDau}</li>
          <li><strong>Pro Conversions:</strong> ${metrics.proConversions}</li>
          <li><strong>Estimated AI Cost:</strong> $${metrics.totalAiCost}</li>
        </ul>
        <h3>Feature Usage Breakdown</h3>
        <ul>
          <li>Chats: ${metrics.featureUsage.chat || 0}</li>
          <li>Quizzes: ${metrics.featureUsage.quiz || 0}</li>
          <li>Notes: ${metrics.featureUsage.notes || 0}</li>
        </ul>
        <p><a href="https://loksewai.com/admin/stats">View Full Admin Dashboard</a></p>
      `,
    });
    console.log('Weekly report email sent successfully.');
  } catch (error) {
    console.error('Failed to send weekly report email:', error);
  }
}

export async function sendPaymentApprovedEmail(userEmail: string, userName: string, plan: string, amount: string | number) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Payment approved email not sent to', userEmail);
    return;
  }

  try {
    const htmlContent = getPaymentApprovedTemplate(userName, plan, amount);
    await resend.emails.send({
      from: `Loksewa AI <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `🎉 Payment Approved - Welcome to Loksewa AI Premium!`,
      html: htmlContent,
    });
    console.log('Payment approved email sent successfully to', userEmail);
  } catch (error) {
    console.error('Failed to send payment approved email:', error);
  }
}

export async function sendPaymentRejectedEmail(userEmail: string, userName: string, plan: string, reason: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Payment rejected email not sent to', userEmail);
    return;
  }

  try {
    const htmlContent = getPaymentRejectedTemplate(userName, plan, reason);
    await resend.emails.send({
      from: `Loksewa AI <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `Update regarding your Loksewa AI Payment`,
      html: htmlContent,
    });
    console.log('Payment rejected email sent successfully to', userEmail);
  } catch (error) {
    console.error('Failed to send payment rejected email:', error);
  }
}
