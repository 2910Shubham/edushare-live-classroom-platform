import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn('Resend API key missing. Email not sent:', { to, subject });
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EduShare <noreply@edushare.app>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
