'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import ContactFormEmail from '@/emails/contact-form-email';
import React from 'react';

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
    return {
      success: false,
      message: 'Server configuration error: Recipient email is not set.',
    };
  }

  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors[Object.keys(validatedFields.error.flatten().fieldErrors)[0]][0] || 'Invalid form data.',
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New Message: ${subject}`,
      react: React.createElement(ContactFormEmail, {
        name,
        email,
        message,
      }),
    });

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
