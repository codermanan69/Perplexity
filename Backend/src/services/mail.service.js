import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default testing email for Resend
            to,
            subject,
            html,
            text
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
        } else {
            console.log("Email sent successfully via Resend:", data);
        }
    } catch (err) {
        console.error("Failed to send email via Resend:", err);
    }
} 