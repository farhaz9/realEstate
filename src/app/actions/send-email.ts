'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import ContactFormEmail from '@/emails/contact-form-email';
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
    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New Message from Delhi Estate Luxe: ${subject}`,
      reply_to: email,
      react: React.createElement(ContactFormEmail, {
        name,
        email,
        message,
      }),
    });

    if (data.error) {
       console.error('Resend API error:', data.error);
       return { success: false, message: 'Failed to send email due to a server error.' };
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
