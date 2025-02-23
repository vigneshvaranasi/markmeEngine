import sgMail from '@sendgrid/mail'
import ENV from '../configs/default'
const { SENDGRID_API_KEY } = ENV

sgMail.setApiKey(SENDGRID_API_KEY!);
export const sendOTP = async (to: string, otp: string) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'default@example.com',
    subject: 'Your OTP for Completing Registration',
    text: `OTP: ${otp}`
  }

  try {
    await sgMail.send(msg)
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}