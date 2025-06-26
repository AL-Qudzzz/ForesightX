'use server';
/**
 * @fileOverview A flow to generate fictional, up-to-date cryptocurrency news articles.
 *
 * - generateNews - A function that generates a list of news articles.
 * - GenerateNewsInput - The input type for the generateNews function.
 * - GenerateNewsOutput - The return type for the generateNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsArticleSchema = z.object({
  id: z.number().describe('A unique number for the article.'),
  title: z.string().describe('The headline of the news article.'),
  source: z
    .string()
    .describe(
      'The name of the fictional news source or publication (e.g., "CryptoNews Daily", "DeFi Times").'
    ),
  timestamp: z
    .string()
    .datetime()
    .describe(
      'The ISO 8601 timestamp of when the news was published (e.g., a time from today or yesterday).'
    ),
  summary: z
    .string()
    .describe('A brief, one-paragraph summary of the news article.'),
  url: z.string().describe('A placeholder URL, should just be "#".'),
});

export const GenerateNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type GenerateNewsOutput = z.infer<typeof GenerateNewsOutputSchema>;

export const GenerateNewsInputSchema = z.object({
  topic: z
    .string()
    .default('cryptocurrency')
    .describe('The topic for the news articles.'),
});
export type GenerateNewsInput = z.infer<typeof GenerateNewsInputSchema>;

export async function generateNews(
  input: GenerateNewsInput
): Promise<GenerateNewsOutput> {
  return generateNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsPrompt',
  input: {schema: GenerateNewsInputSchema},
  output: {schema: GenerateNewsOutputSchema},
  prompt: `You are a financial news AI. Generate 5 recent, realistic, but fictional news articles about the topic of {{{topic}}}.

      The news should be varied, covering different cryptocurrencies, market trends, and regulatory news. Make the timestamps recent, within the last 48 hours. The source should be a plausible but fictional news outlet name. The URL should always be '#'.
      `,
});

const generateNewsFlow = ai.defineFlow(
  {
    name: 'generateNewsFlow',
    inputSchema: GenerateNewsInputSchema,
    outputSchema: GenerateNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
