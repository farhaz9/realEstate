'use server';

/**
 * @fileOverview A flow for generating a commit message from a code diff.
 *
 * - generateCommitMessage - A function that takes a code diff and generates a commit message.
 * - GenerateCommitMessageInput - The input type for the generateCommitMessage function.
 * - GenerateCommitMessageOutput - The return type for the generateCommitMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCommitMessageInputSchema = z.object({
  diff: z.string().describe('The code diff to be summarized in a commit message.'),
});
export type GenerateCommitMessageInput = z.infer<typeof GenerateCommitMessageInputSchema>;

const GenerateCommitMessageOutputSchema = z.object({
    commitMessage: z.string().describe('A concise, well-structured commit message summarizing the changes.'),
});
export type GenerateCommitMessageOutput = z.infer<typeof GenerateCommitMessageOutputSchema>;

const commitMessagePrompt = ai.definePrompt({
  name: 'commitMessagePrompt',
  input: { schema: GenerateCommitMessageInputSchema },
  output: { schema: GenerateCommitMessageOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert at writing commit messages. Based on the following code diff, generate a concise and descriptive commit message.

The commit message should follow the Conventional Commits specification. It should start with a type (e.g., 'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'), followed by a short description in the imperative mood.

For example:
- feat: Add user authentication
- fix: Correct calculation for order total
- docs: Update README with setup instructions

Here is the code diff:
\`\`\`diff
{{{diff}}}
\`\`\`

Generate the commit message.`,
});

const generateCommitMessageFlow = ai.defineFlow(
  {
    name: 'generateCommitMessageFlow',
    inputSchema: GenerateCommitMessageInputSchema,
    outputSchema: GenerateCommitMessageOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await commitMessagePrompt(input);
      return output!;
    } catch (e) {
      console.error("AI commit message generation failed:", e);
      return { commitMessage: "chore: Automated commit message generation failed." };
    }
  }
);

export async function generateCommitMessage(input: GenerateCommitMessageInput): Promise<GenerateCommitMessageOutput> {
  return generateCommitMessageFlow(input);
}
