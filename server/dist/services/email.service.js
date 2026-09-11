"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendOtpEmail({ to, otp, userName }) {
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s+/g, ''); // strip spaces from Google app password
    const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const from = process.env.EMAIL_FROM || (user ? `"HostelHub" <${user}>` : '"HostelHub" <no-reply@hostelhub.app>');
    const greeting = userName ? `Hello ${userName},` : 'Hello,';
    // Always print prominently to server console
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│               📧 HostelHub Email OTP                   │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ To:      ${to.padEnd(46)}│`);
    console.log(`│ Code:    ${otp.padEnd(46)}│`);
    console.log(`│ Expires: 10 minutes                                    │`);
    console.log('└────────────────────────────────────────────────────────┘\n');
    let delivered_via_smtp = false;
    let smtp_error;
    if (user && pass) {
        try {
            const isGmail = host === 'smtp.gmail.com' || user.includes('@gmail.com');
            const transporter = nodemailer_1.default.createTransport(isGmail
                ? {
                    service: 'gmail',
                    auth: { user, pass },
                }
                : {
                    host: host || 'smtp.gmail.com',
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                });
            const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px 20px; background: #0f172a; border-radius: 12px; margin-bottom: 12px;">
              <span style="font-size: 22px; font-weight: bold; color: #ffffff;">🏨 Hostel<span style="color: #38bdf8;">Hub</span></span>
            </div>
            <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 700;">Your Login Code</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Use this 6-digit code to sign in to your HostelHub account</p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.5;">${greeting}</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Here is your single-use verification code:</p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; padding: 16px 36px; background: #f8fafc; border: 2px dashed #0284c7; border-radius: 14px; letter-spacing: 10px; font-size: 34px; font-weight: 800; color: #0f172a; font-family: monospace;">
              ${otp}
            </div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
            This code will expire in <strong>10 minutes</strong>.<br />
            If you did not request this code, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            HostelHub Management System &bull; Connect. Report. Improve.
          </p>
        </div>
      `;
            await transporter.sendMail({
                from,
                to,
                subject: `Your HostelHub Login Code: ${otp}`,
                text: `${greeting}\n\nYour HostelHub verification code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this code, please ignore this email.`,
                html,
            });
            delivered_via_smtp = true;
            console.log(`✅ Verification email successfully sent to ${to} via SMTP!`);
        }
        catch (error) {
            smtp_error = error.message;
            console.error(`⚠️ Failed to send email via SMTP: ${error.message}`);
        }
    }
    else {
        smtp_error = 'SMTP credentials not configured in server/.env';
    }
    return {
        success: true,
        delivered_via_smtp,
        smtp_error: delivered_via_smtp ? undefined : smtp_error,
    };
}
