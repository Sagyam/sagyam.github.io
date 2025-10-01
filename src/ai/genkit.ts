import { genkit } from 'genkit';
import { anthropic } from 'genkitx-anthropic';

export const ai = genkit({
  plugins: [anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })],
  model: 'anthropic/claude-3-5-sonnet',
});
