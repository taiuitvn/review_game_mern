// Email service for password reset functionality
import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Using mock email service.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to other email services
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (missing credentials), use mock service
    if (!transporter) {
      console.log(`
=============================================================
MOCK EMAIL SERVICE - PASSWORD RESET
=============================================================
To: ${email}
Subject: Reset Your Game Hub Password

Dear User,

You have requested to reset your password for Game Hub.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Game Hub Team
=============================================================
      `);
      return { success: true, message: 'Reset email sent successfully (mock)' };
    }

    // Send real email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Game Hub Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Game Hub</h1>
          </div>
          <h2 style="color: #374151; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #6b7280; line-height: 1.6;">You have requested to reset your password for your Game Hub account.</p>
          <p style="color: #6b7280; line-height: 1.6;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Best regards,<br>Game Hub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    
    return { success: true, message: 'Reset email sent successfully' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send reset email' };
  }
};

export const sendPasswordResetConfirmation = async (email) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (missing credentials), use mock service
    if (!transporter) {
      console.log(`
=============================================================
MOCK EMAIL SERVICE - PASSWORD RESET CONFIRMATION
=============================================================
To: ${email}
Subject: Password Reset Successful - Game Hub

Dear User,

Your password has been successfully reset for your Game Hub account.

If you didn't make this change, please contact our support team immediately.

Best regards,
Game Hub Team
=============================================================
      `);
      return { success: true, message: 'Confirmation email sent successfully (mock)' };
    }

    // Send real email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful - Game Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Game Hub</h1>
          </div>
          <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Successful</h2>
          <p style="color: #6b7280; line-height: 1.6;">Your password has been successfully reset for your Game Hub account.</p>
          <p style="color: #6b7280; line-height: 1.6;">You can now log in with your new password.</p>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">⚠️ If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Best regards,<br>Game Hub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully to:', email);
    
    return { success: true, message: 'Confirmation email sent successfully' };
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return { success: false, message: 'Failed to send confirmation email' };
  }
};
