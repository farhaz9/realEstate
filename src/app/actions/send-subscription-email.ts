'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import SubscriptionEmail from '@/emails/subscription-email';
import React from 'react';
import 'dotenv/config';

const subscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type SubscriptionFormState = {
  success: boolean;
  message: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubscriptionEmail(
  prevState: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  if (!process.env.RESEND_API_KEY) {
    console.error('Server configuration error: Resend API key is not set.');
    return {
      success: false,
      message: 'The email service is not configured correctly. Please contact support.',
    };
  }

  const validatedFields = subscriptionSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Invalid email address.',
    };
  }

  const { email } = validatedFields.data;

  try {
    const data = await resend.emails.send({
      from: 'Falcon Estates <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to the Falcon Estates Newsletter!',
      react: React.createElement(SubscriptionEmail, { email }),
    });

    if (data.error) {
       console.error('Resend API error:', data.error);
       return { success: false, message: 'Failed to subscribe due to a server error.' };
    }

    return {
      success: true,
      message: 'Thank you for subscribing! Please check your inbox.',
    };
  } catch (error) {
    console.error('Subscription email sending failed:', error);
    return {
      success: false,
      message: 'Failed to subscribe. Please try again later.',
    };
  }
}
