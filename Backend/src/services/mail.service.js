import { BrevoClient } from '@getbrevo/brevo';

// Lazy initialize or initialize immediately if key exists
const apiKey = process.env.BREVO_API_KEY;
const brevo = apiKey ? new BrevoClient({ apiKey }) : null;

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is not set in the environment variables.");
        }
        
        const client = brevo || new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
        const senderEmail = process.env.BREVO_SENDER_EMAIL;
        const senderName = process.env.BREVO_SENDER_NAME;

        if (!senderEmail) {
            throw new Error("BREVO_SENDER_EMAIL is not set in the environment variables.");
        }

        const recipients = Array.isArray(to) 
            ? to.map(email => ({ email })) 
            : [{ email: to }];

        const data = await client.transactionalEmails.sendTransacEmail({
            sender: { 
                name: senderName || "Perplexity Team", 
                email: senderEmail 
            },
            to: recipients,
            subject,
            htmlContent: html,
            textContent: text
        });

        console.log("Email sent successfully via Brevo:", data);
        return data;
    } catch (err) {
        console.error("Failed to send email via Brevo:", err);
        throw err;
    }
}