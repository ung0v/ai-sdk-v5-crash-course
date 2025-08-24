import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  JsonToSseTransformStream,
  streamText,
  type UIMessage,
} from 'ai';
import { google } from '@ai-sdk/google';
import {
  createChat,
  getChat,
  appendToChatMessages,
  createStream,
  loadStreamsByChatId,
} from './persistence-layer.ts';
import { createResumableStreamContext } from 'resumable-stream';

const streamContext = createResumableStreamContext({
  // NOTE: In most cases, you'll pass in a waitUntil
  // function that will ensure that the current program
  // stays alive, such as 'after' from next/after.

  // Since we're in a demo environment, we can
  // pass in null.
  waitUntil: null,
});

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[]; id: string } =
    await req.json();

  const { messages, id } = body;

  let chat = await getChat(id);
  const mostRecentMessage = messages[messages.length - 1];

  if (!mostRecentMessage) {
    return new Response('No messages provided', { status: 400 });
  }

  if (mostRecentMessage.role !== 'user') {
    return new Response('Last message must be from the user', {
      status: 400,
    });
  }

  if (!chat) {
    const newChat = await createChat(id, messages);
    chat = newChat;
  } else {
    await appendToChatMessages(id, [mostRecentMessage]);
  }

  const dbStream = await createStream(id);

  const result = streamText({
    model: google('gemini-2.0-flash-001'),
    messages: convertToModelMessages(messages),
  });

  const stream = result.toUIMessageStream();

  const resumableStream = await streamContext.resumableStream(
    dbStream.id,
    () => stream.pipeThrough(new JsonToSseTransformStream()),
  );

  return createUIMessageStreamResponse({
    stream: resumableStream,
  });
};

export const GET = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('No chatId provided', { status: 400 });
  }

  const streams = await loadStreamsByChatId(chatId);

  const mostRecentStream = streams[streams.length - 1];

  if (!mostRecentStream) {
    return new Response('No streams found', { status: 404 });
  }

  const existingStream =
    await streamContext.resumeExistingStream(
      mostRecentStream.id,
    );

  if (existingStream) {
    return new Response(existingStream);
  }

  const emptyDataStream = createUIMessageStream({
    execute: () => {},
  });

  return new Response(
    await streamContext.resumableStream(
      mostRecentStream.id,
      () =>
        emptyDataStream.pipeThrough(
          new JsonToSseTransformStream(),
        ),
    ),
  );
};
