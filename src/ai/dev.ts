import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-crypto-sentiment.ts';
import '@/ai/flows/generate-news-flow.ts';
import '@/ai/flows/generate-market-report-flow.ts';
import '@/ai/flows/crypto-advisor-flow.ts';
