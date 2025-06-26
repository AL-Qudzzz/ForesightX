'use server';
/**
 * @fileOverview An AI-powered crypto advisor chat flow.
 *
 * - chatWithAdvisor - A function that handles the conversation with the crypto advisor.
 * - ChatWithAdvisorInput - The input type for the chatWithAdvisor function.
 * - ChatWithAdvisorOutput - The return type for the chatWithAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateNews} from './generate-news-flow';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatWithAdvisorInputSchema = z.object({
  query: z.string().describe("The user's question to the crypto advisor."),
  history: z
    .array(ChatMessageSchema)
    .optional()
    .describe('The conversation history.'),
});
export type ChatWithAdvisorInput = z.infer<typeof ChatWithAdvisorInputSchema>;

const ChatWithAdvisorOutputSchema = z.object({
  response: z.string().describe("The AI advisor's response."),
});
export type ChatWithAdvisorOutput = z.infer<typeof ChatWithAdvisorOutputSchema>;

export async function chatWithAdvisor(
  input: ChatWithAdvisorInput
): Promise<ChatWithAdvisorOutput> {
  return cryptoAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cryptoAdvisorPrompt',
  input: {
    schema: z.object({
      query: ChatWithAdvisorInputSchema.shape.query,
      formattedHistory: z.string().describe('The formatted conversation history.'),
      newsContext: z
        .string()
        .describe('A list of recent news headlines for context.'),
    }),
  },
  output: {schema: ChatWithAdvisorOutputSchema},
  prompt: `You are ForesightX Advisor, an expert AI assistant specializing in cryptocurrency analysis and market trends. It is currently mid-2025. Your role is to provide insightful, data-driven answers to user questions.

IMPORTANT: You are an AI assistant. You MUST NOT provide financial advice. Always include a disclaimer at the end of your responses, such as "This is not financial advice. Please do your own research."

Use the following recent news headlines to inform your answers. Do not mention that you are using these headlines unless the user asks for sources.
<LATEST_NEWS>
{{{newsContext}}}
</LATEST_NEWS>

This is the conversation history so far:
{{{formattedHistory}}}

Now, answer the user's latest question.
User: {{{query}}}
Advisor:`,
});

const cryptoAdvisorFlow = ai.defineFlow(
  {
    name: 'cryptoAdvisorFlow',
    inputSchema: ChatWithAdvisorInputSchema,
    outputSchema: ChatWithAdvisorOutputSchema,
  },
  async input => {
    const newsResult = await generateNews({topic: 'cryptocurrency'});
    const newsContext = newsResult.articles
      .map(a => `- ${a.title}`)
      .join('\n');

    const formattedHistory = (input.history || [])
      .map(h => (h.role === 'user' ? `User: ${h.content}` : `Advisor: ${h.content}`))
      .join('\n');

    const {output} = await prompt({
      query: input.query,
      formattedHistory,
      newsContext,
    });
    return output!;
  }
);
