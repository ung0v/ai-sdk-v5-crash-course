import { google } from '@ai-sdk/google';
import { stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.ts';

const PROMPT = `
  Please generate a sample PRD, and please make sure your working direct empty before any actions.
`;

const result = streamText({
  model: google('gemini-2.5-flash'),
  system: `
    You are a helpful assistant that can use a sandboxed file system to create, edit and delete files.

    You have access to the following tools:
    - writeFile
    - readFile
    - deletePath
    - listDirectory
    - createDirectory
    - exists
    - searchFiles

    Use these tools to record notes, create todo lists, and edit documents for the user.

    Use markdown files to store information.
  `,
  prompt: PROMPT,
  tools: {
    writeFile: tool({
      description: 'Write to a file',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the file to create'),
        content: z
          .string()
          .describe('The content of the file to create'),
      }),
      execute: async ({ path, content }) => {
        return fsTools.writeFile(path, content);
      },
    }),
    readFile: tool({
      description: 'Read a file',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the file to read'),
      }),
      execute: async ({ path }) => {
        return fsTools.readFile(path);
      },
    }),
    deletePath: tool({
      description: 'Delete a file or directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            'The path to the file or directory to delete',
          ),
      }),
      execute: async ({ path }) => {
        return fsTools.deletePath(path);
      },
    }),
    listDirectory: tool({
      description: 'List a directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the directory to list'),
      }),
      execute: async ({ path }) => {
        return fsTools.listDirectory(path);
      },
    }),
    createDirectory: tool({
      description: 'Create a directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the directory to create'),
      }),
      execute: async ({ path }) => {
        return fsTools.createDirectory(path);
      },
    }),
    exists: tool({
      description: 'Check if a file or directory exists',
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            'The path to the file or directory to check',
          ),
      }),
      execute: async ({ path }) => {
        return fsTools.exists(path);
      },
    }),
    searchFiles: tool({
      description: 'Search for files',
      inputSchema: z.object({
        pattern: z
          .string()
          .describe('The pattern to search for'),
      }),
      execute: async ({ pattern }) => {
        return fsTools.searchFiles(pattern);
      },
    }),
  },
  stopWhen: [stepCountIs(10)],
});

const stream = result.toUIMessageStream({
  onFinish: ({ messages }) => {
    console.log('--- ON FINISH ---');
    console.dir(messages, { depth: null });
  },
});

console.log('--- STREAM ---');

for await (const message of stream) {
  console.log(message);
}
