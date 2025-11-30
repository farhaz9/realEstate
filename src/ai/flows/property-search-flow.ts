
'use server';

/**
 * @fileOverview A flow for analyzing a user's real estate search query.
 *
 * - analyzeSearchQuery - A function that takes a natural language query and returns structured search criteria.
 * - SearchQueryInput - The input type for the analyzeSearchQuery function.
 * - SearchAnalysis - The return type for the analyzeSearchQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchQueryInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query for a property.'),
});
export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;

const SearchAnalysisSchema = z.object({
  listingType: z.enum(['sale', 'rent']).optional().describe('Whether the user wants to buy or rent a property.'),
  propertyType: z.string().optional().describe('The type of property (e.g., "apartment", "villa", "plot").'),
  location: z.string().optional().describe('The geographical area, city, or neighborhood the user is interested in.'),
  bedrooms: z.number().optional().describe('The number of bedrooms the user is looking for.'),
});
export type SearchAnalysis = z.infer<typeof SearchAnalysisSchema>;

const propertySearchPrompt = ai.definePrompt({
  name: 'propertySearchPrompt',
  input: { schema: SearchQueryInputSchema },
  output: { schema: SearchAnalysisSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert real estate search assistant. Analyze the user's search query and extract structured information.

User Query: {{{query}}}

- Identify if the user wants to "sale" (buy) or "rent".
- Identify the type of property (e.g., "apartment", "villa", "house", "plot").
- Identify the location (city, neighborhood, etc.).
- Identify the number of bedrooms. The term 'BHK' means Bedroom, Hall, Kitchen. So, '3BHK' means 3 bedrooms.

Return only the extracted information in the specified JSON format. If a piece of information is not present, omit the key.`,
});

const propertySearchFlow = ai.defineFlow(
  {
    name: 'propertySearchFlow',
    inputSchema: SearchQueryInputSchema,
    outputSchema: SearchAnalysisSchema,
  },
  async (input) => {
    const { output } = await propertySearchPrompt(input);
    return output!;
  }
);

export async function analyzeSearchQuery(input: SearchQueryInput): Promise<SearchAnalysis> {
  return propertySearchFlow(input);
}

    