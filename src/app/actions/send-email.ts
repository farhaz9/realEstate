
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import ContactFormEmail from '@/emails/contact-form-email';
import ContactFormReceiptEmail from '@/emails/contact-form-receipt-email';
import React from 'react';
import 'dotenv/config';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

type ContactFormState = {
  success: boolean;
  message: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.TO_EMAIL;
const fromEmail = 'Falcon Estates <noreply@contact.falconaxe.com>';

export async function sendEmail(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  if (!toEmail) {
    console.error('Server configuration error: Recipient email (TO_EMAIL) is not set in .env file.');
    return {
      success: false,
      message: 'The server is not configured to receive messages. Please contact support.',
    };
  }
   if (!process.env.RESEND_API_KEY) {
    console.error('Server configuration error: Resend API key is not set.');
    return {
      success: false,
      message: 'The email service is not configured correctly. Please contact support.',
    };
  }

  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      success: false,
      message: firstError || 'Invalid form data. Please check your entries.',
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    // Promise to send email to the admin
    const sendToAdminPromise = resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Message from Falcon Estates: ${subject}`,
      reply_to: email,
      react: React.createElement(ContactFormEmail, {
        name,
        email,
        message,
      }),
    });

    // Promise to send a confirmation email to the user
    const sendToUserPromise = resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: "We've received your message | Falcon Estates",
        react: React.createElement(ContactFormReceiptEmail, {
            name: name,
        }),
    });

    const [adminResult, userResult] = await Promise.all([sendToAdminPromise, sendToUserPromise]);

    if (adminResult.error) {
       console.error('Resend API error (to admin):', adminResult.error);
       return { success: false, message: 'Failed to send email due to a server error.' };
    }
    
    if (userResult.error) {
        // Log the error but don't block success for the user if the admin email went through
        console.error('Resend API error (to user):', userResult.error);
    }


    return {
      success: true,
      message: 'Your message has been sent successfully!',
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      message: 'Failed to send your message. Please try again later.',
    };
  }
}
