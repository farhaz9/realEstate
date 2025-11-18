'use server';

/**
 * @fileOverview Provides personalized property recommendations based on user preferences and browsing history.
 * This file exports:
 *   - personalizedPropertyRecommendations: A function to generate property recommendations.
 *   - PersonalizedPropertyRecommendationsInput: The input type for the function.
 *   - PersonalizedPropertyRecommendationsOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPropertyRecommendationsInputSchema = z.object({
  priceRange: z
    .string()
    .describe('The desired price range for the property (e.g., $500,000 - $750,000).'),
  location: z.string().describe('The preferred location or neighborhood (e.g., South Delhi).'),
  propertyType: z.string().describe('The type of property desired (e.g., apartment, villa, penthouse).'),
  desiredAmenities: z
    .string()
    .describe('A comma-separated list of desired amenities (e.g., pool, gym, garden).'),
  browsingHistory: z
    .string()
    .describe(
      'A summary of the user’s browsing history on the platform, including viewed properties and search queries.'
    ),
});
export type PersonalizedPropertyRecommendationsInput = z.infer<
  typeof PersonalizedPropertyRecommendationsInputSchema
>;

const PersonalizedPropertyRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'A list of recommended properties, including their names, descriptions, and reasons for the recommendation.'
    ),
});
export type PersonalizedPropertyRecommendationsOutput = z.infer<
  typeof PersonalizedPropertyRecommendationsOutputSchema
>;

export async function personalizedPropertyRecommendations(
  input: PersonalizedPropertyRecommendationsInput
): Promise<PersonalizedPropertyRecommendationsOutput> {
  return personalizedPropertyRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedPropertyRecommendationsPrompt',
  input: {schema: PersonalizedPropertyRecommendationsInputSchema},
  output: {schema: PersonalizedPropertyRecommendationsOutputSchema},
  prompt: `You are an AI assistant specializing in providing personalized property recommendations in Delhi.

  Based on the user's stated preferences and browsing history, recommend a list of properties that are most likely to interest them.
  Explain why each property is recommended based on the preferences.

  User Preferences:
  - Price Range: {{{priceRange}}}
  - Location: {{{location}}}
  - Property Type: {{{propertyType}}}
  - Desired Amenities: {{{desiredAmenities}}}

  Browsing History:
  {{{browsingHistory}}}

  Provide the recommendations in a clear and concise manner.
  `,
});

const personalizedPropertyRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedPropertyRecommendationsFlow',
    inputSchema: PersonalizedPropertyRecommendationsInputSchema,
    outputSchema: PersonalizedPropertyRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
