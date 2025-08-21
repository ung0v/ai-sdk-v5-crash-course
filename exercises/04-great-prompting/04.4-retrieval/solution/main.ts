import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { tavily } from '@tavily/core';

// const INPUT = `What did Guillermo Rauch say about Matt Pocock?`;
// const URL = `https://www.aihero.dev/`;

// const INPUT = `What is Matt Pocock's open source background?`;
// const URL = `https://www.aihero.dev/`;

const INPUT = `Why is learning TypeScript important?`;
const URL = `https://totaltypescript.com/`;

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const scrapeResult = await tavilyClient.extract([URL]);

const rawContent = scrapeResult.results[0]?.rawContent;

if (!rawContent) {
  throw new Error('Could not scrape the URL');
}

const result = await streamText({
  model: google('gemini-2.0-flash-lite'),
  prompt: `
    <task-context>
    You are a helpful assistant that summarizes the content of a URL.
    </task-context>

    <background-data>
    Here is the content of the website:
    <url>
    ${URL}
    </url>
    <content>
    ${rawContent}
    </content>
    </background-data>

    <rules>
    - Use the content of the website to answer the question.
    - If the question is not related to the content of the website, say "I'm sorry, I can only answer questions about the content of the website."
    - Use quotes from the content of the website to answer the question.
    - Use paragraphs in your output.
    </rules>
    
    <conversation-history>
    ${INPUT}
    </conversation-history>

    <the-ask>
    Summarize the content of the website based on the conversation history.
    </the-ask>

    <output-format>
    Return only the summary.
    </output-format>
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
