'use server';

/**
 * @fileOverview Summarizes blog posts from a given URL.
 *
 * - summarizeBlog - A function that summarizes a blog post.
 * - SummarizeBlogInput - The input type for the summarizeBlog function.
 * - SummarizeBlogOutput - The return type for the summarizeBlog function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const SummarizeBlogInputSchema = z.object({
  url: z.string().url().describe('The URL of the blog post to summarize.'),
});
export type SummarizeBlogInput = z.infer<typeof SummarizeBlogInputSchema>;

const SummarizeBlogOutputSchema = z.object({
  summary: z.string().describe('A short summary of the blog post.'),
});
export type SummarizeBlogOutput = z.infer<typeof SummarizeBlogOutputSchema>;

export async function summarizeBlog(
  input: SummarizeBlogInput
): Promise<SummarizeBlogOutput> {
  return summarizeBlogFlow(input);
}

const contentExtractor = ai.defineTool(
  {
    name: 'contentExtractor',
    description: 'Extracts the main content from a given URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to extract content from.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await fetch(input.url);
    const html = await response.text();

    // Basic content extraction (replace with a more robust solution if needed)
    const textContent = html.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return textContent.substring(0, 1000); // Return first 1000 characters
  }
);

const prompt = ai.definePrompt({
  name: 'summarizeBlogPrompt',
  input: { schema: SummarizeBlogInputSchema },
  output: { schema: SummarizeBlogOutputSchema },
  tools: [contentExtractor],
  prompt: `Summarize the content extracted from the following URL in a concise manner:\n\nURL: {{{url}}}\nExtracted Content: {{await contentExtractor url=url}}\n\nSummary:`, //A tool call
});

const summarizeBlogFlow = ai.defineFlow(
  {
    name: 'summarizeBlogFlow',
    inputSchema: SummarizeBlogInputSchema,
    outputSchema: SummarizeBlogOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
