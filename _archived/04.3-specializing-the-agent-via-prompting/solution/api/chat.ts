import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type InferUITools,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.ts';

export type MyUIMessage = UIMessage<
  never,
  never,
  InferUITools<typeof tools>
>;

const tools = {
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
      path: z.string().describe('The path to the file to read'),
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
        .describe('The path to the file or directory to delete'),
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
        .describe('The path to the file or directory to check'),
    }),
    execute: async ({ path }) => {
      return fsTools.exists(path);
    },
  }),
  searchFiles: tool({
    description: 'Search for files',
    inputSchema: z.object({
      pattern: z.string().describe('The pattern to search for'),
    }),
    execute: async ({ pattern }) => {
      return fsTools.searchFiles(pattern);
    },
  }),
};

const fileSystemAgentSystemPrompt = (opts: {
  existingFiles: string[];
  todos: string;
}) => `
<task-context>
  You are a helpful assistant that acts as a second brain for the user. You have access to a sandboxed file system which will be used to take notes based on your conversation with the user.
</task-context>

<background-data>
  Here are the files that exist in the sandboxed file system:
  <existing-files>
    ${opts.existingFiles.map((p) => `<file>${p}</file>`).join('\n')}
  </existing-files>
  
  Here is the contents of the todos.md file:
  <todos>
  ${opts.todos}
  </todos>
</background-data>

<rules>
  - You can create files with the writeFile tool.
  - You can read files with the readFile tool.
  - You can delete files with the deletePath tool.
  - You can list directories with the listDirectory tool.
  - You can create directories with the createDirectory tool.
  - You can check if a file or directory exists with the exists tool.
  - You can search for files with the searchFiles tool.
  - Todo's should be stored in a single file called "todos.md".
  - Every time the user reveals a piece of information, you should take note of it in a markdown file. This can include preferences, opinions, and plans, and much more.
  - Markdown files should be named after broad topics of conversation.
  - Be proactive in pulling in information from the file system which might be relevant to the conversation.
</rules>
`;

const formatConversationHistory = (messages: MyUIMessage[]) => {
  return messages
    .map(
      (m) =>
        `<message role="${m.role}">${partsToText(m.parts)}</message>`,
    )
    .join('\n');
};

const partsToText = (parts: MyUIMessage['parts']) => {
  return parts
    .map((p) => {
      if (p.type === 'text') {
        return p.text;
      }

      if (p.type === 'tool-createDirectory') {
        return `Called createDirectory tool: ${p.output?.message}`;
      }

      if (p.type === 'tool-writeFile') {
        return `Called writeFile tool: ${p.output?.message}`;
      }

      if (p.type === 'tool-deletePath') {
        return `Called deletePath tool: ${p.output?.message}`;
      }

      if (p.type === 'tool-listDirectory') {
        return `Called listDirectory tool: ${p.output?.message}.`;
      }

      if (p.type === 'tool-exists') {
        return `Called exists tool: ${p.output?.message}.`;
      }

      if (p.type === 'tool-searchFiles') {
        return `Called searchFiles tool: ${p.output?.message}`;
      }

      return '';
    })
    .join('\n');
};

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyUIMessage[] } = await req.json();
  const { messages } = body;

  const existingFiles = fsTools.listDirectory('.');

  const todos = fsTools.readFile('todos.md');

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: fileSystemAgentSystemPrompt({
      existingFiles:
        existingFiles?.items?.map((file) => file.name) ?? [],
      todos:
        todos.content ??
        'todos.md file does not exist on the file system',
    }),
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse();
};
