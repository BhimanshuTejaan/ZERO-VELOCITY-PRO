import nodemailer from 'nodemailer';

/**
 * Generates a professional HTML email template matching Zero Velocity branding.
 */
function generateEmailTemplate({
  customerName,
  licenseKey,
  purchaseDate,
  razorpayPaymentId,
  downloadUrl,
  productName = "Zero Velocity Version 1.0 (Founder Launch)",
  pluginVersion = "v1.0.0",
  supportEmail = "bhimanshutejaan@gmail.com"
}) {
  const formattedDate = purchaseDate 
    ? new Date(purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const greeting = customerName ? `Hello ${customerName},` : `Hello,`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Zero Velocity License Key</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050811;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #050811;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #0a0f1c;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
    }
    .logo-accent {
      color: #3b82f6;
    }
    .header-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 4px 12px;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 9999px;
      color: #60a5fa;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 28px;
    }
    .license-box {
      background: #020617;
      border: 1px solid #1e40af;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 32px;
    }
    .license-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .license-key {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 22px;
      font-weight: 700;
      color: #60a5fa;
      letter-spacing: 2px;
      margin: 0;
      word-break: break-all;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      overflow: hidden;
    }
    .details-table td {
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .details-label {
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }
    .details-value {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .instructions-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .instructions-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .instructions-list {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .instructions-list li {
      margin-bottom: 8px;
    }
    .instructions-list li:last-child {
      margin-bottom: 0;
    }
    .footer {
      background: #070c18;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">ZERO<span class="logo-accent">VELOCITY</span></h1>
        <div class="header-badge">Order Confirmed</div>
      </div>
      
      <div class="content">
        <p class="greeting">${greeting}</p>
        <p class="message">
          Thank you for purchasing <strong>${productName}</strong>! Your order has been verified and your personal license key is active.
        </p>

        <div class="license-box">
          <div class="license-label">Your License Key</div>
          <div class="license-key">${licenseKey}</div>
        </div>

        <table class="details-table">
          <tr>
            <td class="details-label">Product</td>
            <td class="details-value">${productName}</td>
          </tr>
          <tr>
            <td class="details-label">Plugin Version</td>
            <td class="details-value">${pluginVersion}</td>
          </tr>
          <tr>
            <td class="details-label">Purchase Date</td>
            <td class="details-value">${formattedDate}</td>
          </tr>
          ${razorpayPaymentId ? `
          <tr>
            <td class="details-label">Payment ID</td>
            <td class="details-value">${razorpayPaymentId}</td>
          </tr>
          ` : ''}
        </table>

        <!-- Download & Installation Instructions -->
        <div class="instructions-section">
          <div class="instructions-title">📥 Download & Installation Guide</div>
          ${downloadUrl ? `
          <p style="font-size:14px;color:#94a3b8;margin:0 0 16px;">
            Click the button below to download your Zero Velocity package:
          </p>
          <div style="text-align:center;margin-bottom:20px;">
            <a href="${downloadUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
              ⬇️ Download Zero Velocity v1.0
            </a>
          </div>
          ` : `
          <p style="font-size:14px;color:#94a3b8;margin:0 0 16px;">
            Visit the Zero Velocity website, sign in with your Google account, and click
            <strong style="color:#f1f5f9;">Downloads</strong> in your profile menu to download your package.
          </p>
          `}
          <ol class="instructions-list">
            <li>Download and install the free <strong>ZXP Installer</strong> from <a href="https://aescripts.com/learn/zxp-installer/" style="color:#3b82f6;">aescripts.com/learn/zxp-installer/</a></li>
            <li>Open ZXP Installer and drag <code>ZeroVelocity-v1.0.0.zxp</code> onto it</li>
            <li>Restart After Effects, then open <strong>Window → Extensions → Zero Velocity</strong></li>
            <li>Enter your License Key (<code>${licenseKey}</code>) when prompted</li>
          </ol>
        </div>
      </div>

      <div class="footer">
        <p>Need assistance or have questions? Contact support at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        <p>&copy; ${new Date().getFullYear()} Zero Velocity. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends a confirmation email to the customer.
 * Missing SMTP credentials or transport errors are caught gracefully to prevent purchase failure.
 */
export async function sendLicenseConfirmationEmail({
  recipientEmail,
  customerName,
  licenseKey,
  purchaseDate,
  razorpayPaymentId,
  downloadUrl
}) {
  if (!recipientEmail) {
    console.warn("⚠️ No recipient email provided for confirmation email.");
    return { success: false, reason: "No recipient email" };
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"Zero Velocity" <noreply@zerovelocity.com>';

  if (!host || !user || !pass) {
    console.log("ℹ️ SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured on Vercel. Skipping live email dispatch.");
    return { success: false, reason: "SMTP credentials unconfigured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const htmlContent = generateEmailTemplate({
      customerName,
      licenseKey,
      purchaseDate,
      razorpayPaymentId,
      downloadUrl: downloadUrl || null
    });

    const mailOptions = {
      from,
      to: recipientEmail,
      subject: `🎉 Your Zero Velocity License Key [${licenseKey}]`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ License confirmation email sent to ${recipientEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error("❌ Failed to deliver confirmation email:", err.message);
    // Return failure result object without throwing so purchase flow succeeds
    return { success: false, error: err.message };
  }
}
