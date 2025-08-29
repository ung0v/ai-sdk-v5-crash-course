import { google } from '@ai-sdk/google';

import { anthropic } from '@ai-sdk/anthropic';

const model = anthropic('claude-3-7-sonnet-20250219');

console.dir(model, { depth: null });
