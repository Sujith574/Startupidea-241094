const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // TLS via STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// ─── Send OTP Email ───────────────────────────────────────────────────────────
async function sendOTPEmail(email, otp, expiresMin = 10) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || `ParcelBridge <${process.env.SMTP_USER}>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a1628;font-family:Inter,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#0f2040;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <div style="background:linear-gradient(135deg,#0c8ee7,#0058a0);padding:32px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">📦 ParcelBridge</div>
          <div style="color:rgba(255,255,255,0.8);margin-top:6px;font-size:14px;">Your Verification Code</div>
        </div>
        <div style="padding:36px 32px;">
          <p style="color:#94a3b8;font-size:14px;margin:0 0 24px 0;">
            Use the code below to sign in to ParcelBridge. It expires in <strong style="color:#f97316;">${expiresMin} minutes</strong>.
          </p>
          <div style="background:#0a1628;border:2px dashed rgba(12,142,231,0.4);border-radius:12px;padding:28px;text-align:center;margin:0 0 24px 0;">
            <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#0c8ee7;font-family:monospace;">${otp}</div>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6;">
            If you didn't request this, ignore this email. Never share this OTP with anyone.
          </p>
        </div>
        <div style="background:#07111f;padding:16px 32px;text-align:center;">
          <p style="color:#334155;font-size:11px;margin:0;">© ${new Date().getFullYear()} ParcelBridge · Ship Smarter. Bridge Every Mile.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await t.sendMail({
    from,
    to: email,
    subject: `${otp} — Your ParcelBridge Login Code`,
    html,
    text: `Your ParcelBridge login OTP is: ${otp}\nExpires in ${expiresMin} minutes.`,
  });

  console.log(`[EMAIL] OTP sent to ${email} | MessageId: ${info.messageId}`);
  return info;
}

// ─── Generic Notification ─────────────────────────────────────────────────────
async function sendNotification(to, subject, body) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || `ParcelBridge <${process.env.SMTP_USER}>`;
  try {
    await t.sendMail({ from, to, subject, text: body });
    console.log(`[NOTIFY] "${subject}" sent to ${to}`);
  } catch (err) {
    console.error(`[NOTIFY][ERROR]`, err.message);
  }
}

const Notifications = {
  bookingConfirmed: (shipmentId, email) =>
    sendNotification(email, '📦 Booking Confirmed — ParcelBridge',
      `Your shipment #${shipmentId} is confirmed! We're assigning a delivery partner.`),

  partnerAssigned: (shipmentId, email, partnerName) =>
    sendNotification(email, '🚴 Pickup Partner Assigned — ParcelBridge',
      `${partnerName} will pick up your parcel for shipment #${shipmentId}.`),

  statusUpdate: (shipmentId, email, status) =>
    sendNotification(email, `📬 Shipment Status: ${status.replace(/_/g, ' ')} — ParcelBridge`,
      `Your shipment #${shipmentId} is now: ${status.replace(/_/g, ' ')}`),
};

module.exports = { sendOTPEmail, Notifications };
