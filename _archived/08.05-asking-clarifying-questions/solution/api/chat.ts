import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
} from 'ai';
import z from 'zod';
import {
  WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
  type MyMessage,
  CHECK_FOR_CLARIFYING_QUESTIONS_SYSTEM,
} from './utils.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      if (messages.length === 1) {
        // Check for clarifying questions
        const checkForClarifyingQuestionsResult = streamObject({
          model: google('gemini-2.0-flash-lite'),
          system: CHECK_FOR_CLARIFYING_QUESTIONS_SYSTEM,
          messages: convertToModelMessages(messages),
          schema: z.object({
            reasoning: z
              .string()
              .optional()
              .describe(
                'The reasoning for why the clarifying question is needed. Only return this if the clarifying question is needed.',
              ),
            clarifyingQuestion: z
              .string()
              .optional()
              .describe(
                'The clarifying question to send to the user. Only return this if the clarifying question is needed.',
              ),
          }),
        });

        const messageDraftId = crypto.randomUUID();

        for await (const part of checkForClarifyingQuestionsResult.partialObjectStream) {
          if (part.reasoning) {
            writer.write({
              type: 'data-clarifying-questions-reasoning',
              data: part.reasoning,
              id: messageDraftId,
            });
          }
        }

        const finalObject =
          await checkForClarifyingQuestionsResult.object;

        console.dir(finalObject, { depth: null });

        // If the draft requires clarifying questions, send them to the user
        // and don't enter the loop
        if (finalObject.clarifyingQuestion) {
          const id = crypto.randomUUID();

          writer.write({
            type: 'text-start',
            id,
          });

          writer.write({
            type: 'text-delta',
            delta: finalObject.clarifyingQuestion,
            id,
          });

          writer.write({
            type: 'text-end',
            id,
          });

          return;
        }
      }

      // Write Slack message
      const writeSlackResult = streamText({
        model: google('gemini-2.0-flash'),
        system: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
        messages: convertToModelMessages(messages),
      });

      writer.merge(writeSlackResult.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
