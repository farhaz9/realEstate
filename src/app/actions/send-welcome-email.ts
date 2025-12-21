
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome-email';
import React from 'react';
import 'dotenv/config';

const welcomeEmailSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

type WelcomeEmailState = {
  success: boolean;
  message: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'Falcon Estates <noreply@contact.falconaxe.com>';

export async function sendWelcomeEmail(
  data: z.infer<typeof welcomeEmailSchema>
): Promise<WelcomeEmailState> {
  if (!process.env.RESEND_API_KEY) {
    console.error('Server configuration error: Resend API key is not set.');
    return {
      success: false,
      message: 'The email service is not configured correctly.',
    };
  }

  const validatedFields = welcomeEmailSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided for welcome email.',
    };
  }

  const { name, email } = validatedFields.data;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Welcome to Falcon Estates, ${name}!`,
      react: React.createElement(WelcomeEmail, { name }),
    });

    if (error) {
      console.error('Resend API error (welcome email):', error);
      return { success: false, message: 'Failed to send welcome email.' };
    }

    return {
      success: true,
      message: 'Welcome email sent successfully!',
    };
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while sending the welcome email.',
    };
  }
}
