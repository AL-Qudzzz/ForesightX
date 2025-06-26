'use server';
/**
 * @fileOverview A flow to generate a detailed cryptocurrency market report.
 *
 * - generateMarketReport - A function that generates a market report.
 * - GenerateMarketReportInput - The input type for the generateMarketReport function.
 * - GenerateMarketReportOutput - The return type for the generateMarketReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketReportInputSchema = z.object({
  newsHeadlines: z
    .string()
    .describe('A comma separated list of recent crypto news headlines.'),
});
export type GenerateMarketReportInput = z.infer<typeof GenerateMarketReportInputSchema>;

const GenerateMarketReportOutputSchema = z.object({
  summary: z.string().describe('A detailed summary paragraph of the overall market sentiment and outlook.'),
  keyTrends: z.array(z.string()).describe('A list of 3-5 key trends or events identified from the headlines that are influencing the market.'),
  confidence: z.number().min(0).max(100).describe('A confidence score from 0 to 100 on the accuracy of this analysis.'),
});
export type GenerateMarketReportOutput = z.infer<typeof GenerateMarketReportOutputSchema>;


export async function generateMarketReport(
  input: GenerateMarketReportInput
): Promise<GenerateMarketReportOutput> {
  return generateMarketReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketReportPrompt',
  input: {schema: GenerateMarketReportInputSchema},
  output: {schema: GenerateMarketReportOutputSchema},
  prompt: `You are an expert cryptocurrency market analyst AI. It is currently mid-2025.
      Analyze the following news headlines and generate a detailed market report.
      The report should include:
      1. A comprehensive summary of the market's current state and outlook.
      2. A bulleted list of 3 to 5 key trends you've identified from the news.
      3. A confidence score (0-100) representing how confident you are in your analysis based on the provided headlines.

      News Headlines: {{{newsHeadlines}}}
      `,
});

const generateMarketReportFlow = ai.defineFlow(
  {
    name: 'generateMarketReportFlow',
    inputSchema: GenerateMarketReportInputSchema,
    outputSchema: GenerateMarketReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
