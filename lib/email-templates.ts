export const BRAND = {
  primary: '#1e3a5f',
  accent: '#c9a84c',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#334155',
  website: 'https://loksewai.com',
};

const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text}; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${BRAND.background}; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: ${BRAND.surface}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND.primary}; padding: 32px 40px; text-align: center;">
              <h1 style="color: ${BRAND.accent}; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">LOKSEWA AI</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.background}; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                &copy; ${new Date().getFullYear()} Loksewa AI. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
                Need help? Contact <a href="mailto:support@loksewai.com" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">support@loksewai.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getPaymentApprovedTemplate = (userName: string, planName: string, amount: string | number) => {
  const content = `
    <h2 style="color: ${BRAND.primary}; margin: 0 0 20px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Payment Approved! 🎉</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Great news! Your payment of <strong>${amount} Rs</strong> has been successfully reviewed and approved by our team. Your account has been upgraded.</p>
    
    <div style="background-color: #f1f5f9; border-left: 4px solid ${BRAND.accent}; padding: 20px; border-radius: 4px; margin-bottom: 32px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Current Plan</p>
      <p style="margin: 0; font-size: 20px; color: ${BRAND.primary}; font-weight: 800;">${planName.replace('_', ' ').toUpperCase()}</p>
    </div>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">You now have full access to premium features including personalized study plans, unlimited AI practice, and advanced syllabus analysis. Let's conquer your Loksewa exams together!</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <a href="${BRAND.website}/dashboard" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.primary}; color: ${BRAND.accent}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Go to Dashboard</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate('Payment Approved - Loksewa AI', content);
};

export const getPaymentRejectedTemplate = (userName: string, planName: string, reason: string) => {
  const content = `
    <h2 style="color: ${BRAND.primary}; margin: 0 0 20px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Payment Update</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">We've reviewed your recent payment request for the <strong>${planName.replace('_', ' ').toUpperCase()}</strong> plan, and unfortunately, we couldn't verify it at this time.</p>
    
    <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 20px; border-radius: 4px; margin-bottom: 32px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #991b1b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Rejection</p>
      <p style="margin: 0; font-size: 16px; color: #991b1b;">${reason}</p>
    </div>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">If you believe this was an error, please try submitting a new request with a clear screenshot of the payment receipt, or contact our support team.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <a href="${BRAND.website}/upgrade" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.primary}; color: ${BRAND.accent}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Submit New Request</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate('Payment Update - Loksewa AI', content);
};

export const getAdminPaymentAlertTemplate = (details: {
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  paymentMethod: string;
}) => {
  const content = `
    <h2 style="color: ${BRAND.primary}; margin: 0 0 20px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🚨 New Payment Request</h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">A user has submitted a new payment screenshot and is waiting for approval.</p>
    
    <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #64748b;">User:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700;">${details.userName} (${details.userEmail})</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #64748b;">Plan:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700;">${details.plan.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #64748b;">Amount:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700;">${details.amount} Rs</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #64748b;">Method:</td>
          <td style="font-size: 14px; font-weight: 700;">${details.paymentMethod}</td>
        </tr>
      </table>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <a href="${BRAND.website}/admin/payments" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.primary}; color: ${BRAND.accent}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Review Payment</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate('New Payment Request - Loksewa AI', content);
};

export const getEmailVerificationTemplate = () => {
  const content = `
    <h2 style="color: ${BRAND.primary}; margin: 0 0 20px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Verify your email</h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Welcome to Loksewa AI! Please confirm your email address by clicking the button below.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.primary}; color: ${BRAND.accent}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Confirm Email</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; line-height: 1.6;">Or copy and paste this URL into your browser:</p>
    <p style="margin: 0; font-size: 12px; color: ${BRAND.primary}; word-break: break-all;">
      <a href="{{ .ConfirmationURL }}" style="color: ${BRAND.primary};">{{ .ConfirmationURL }}</a>
    </p>
  `;
  return baseTemplate('Verify your email - Loksewa AI', content);
};

export const getPasswordResetTemplate = () => {
  const content = `
    <h2 style="color: ${BRAND.primary}; margin: 0 0 20px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Reset your password</h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Loksewa AI account. Click the button below to set a new password.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.primary}; color: ${BRAND.accent}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  return baseTemplate('Reset your password - Loksewa AI', content);
};
