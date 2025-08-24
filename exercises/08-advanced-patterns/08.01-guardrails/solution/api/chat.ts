import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  generateText,
  streamText,
  type InferUIMessageChunk,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';
import { GUARDRAIL_SYSTEM } from './guardrail-prompt.ts';

type MyMessage = UIMessage<
  unknown,
  {
    'guardrail-result': string;
  }
>;

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: MyMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    convertToModelMessages(messages);

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      console.time('Guardrail Time');
      const guardrailResult = await generateText({
        model: google('gemini-2.0-flash-lite'),
        system: GUARDRAIL_SYSTEM,
        messages: modelMessages,
      });

      console.timeEnd('Guardrail Time');

      console.log(
        'guardrailResult',
        guardrailResult.text.trim(),
      );

      if (guardrailResult.text.trim() === '0') {
        const textPartId = crypto.randomUUID();

        writer.write({
          type: 'text-start',
          id: textPartId,
        });

        writer.write({
          type: 'text-delta',
          id: textPartId,
          delta: guardrailResult.text,
        });

        writer.write({
          type: 'text-end',
          id: textPartId,
        });

        return;
      }

      const streamTextResult = streamText({
        model: google('gemini-2.0-flash'),
        messages: modelMessages,
      });

      writer.merge(streamTextResult.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
