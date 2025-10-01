'use server';

/**
 * @fileOverview Generates tailored job experience summaries from a resume, focusing on DevOps/Cloud Engineer roles.
 *
 * - generateTailoredExperienceSummaries - A function that takes a resume data URI and returns tailored job experience summaries.
 * - TailoredExperienceSummariesInput - The input type for the generateTailoredExperienceSummaries function.
 * - TailoredExperienceSummariesOutput - The return type for the generateTailoredExperienceSummaries function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const TailoredExperienceSummariesInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TailoredExperienceSummariesInput = z.infer<
  typeof TailoredExperienceSummariesInputSchema
>;

const TailoredExperienceSummariesOutputSchema = z.object({
  summaries: z
    .string()
    .describe(
      'Summarized job experiences tailored for DevOps/Cloud Engineer roles.'
    ),
});
export type TailoredExperienceSummariesOutput = z.infer<
  typeof TailoredExperienceSummariesOutputSchema
>;

export async function generateTailoredExperienceSummaries(
  input: TailoredExperienceSummariesInput
): Promise<TailoredExperienceSummariesOutput> {
  return tailoredExperienceSummariesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailoredExperienceSummariesPrompt',
  input: { schema: TailoredExperienceSummariesInputSchema },
  output: { schema: TailoredExperienceSummariesOutputSchema },
  prompt: `You are a career advisor specializing in tailoring resumes for DevOps and Cloud Engineering roles.  A candidate will provide their resume, and you will provide a summary of their job experiences focusing on aspects of the experience relevant to DevOps and Cloud Engineering. Exclude any irrelevant information.

Resume: {{media url=resumeDataUri}}`,
});

const tailoredExperienceSummariesFlow = ai.defineFlow(
  {
    name: 'tailoredExperienceSummariesFlow',
    inputSchema: TailoredExperienceSummariesInputSchema,
    outputSchema: TailoredExperienceSummariesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
