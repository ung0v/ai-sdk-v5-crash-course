import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';
import {
  addMessage,
  createChat,
  getChat,
} from './persistence-layer.ts';
import { constructMessageHistoryFromMessageMap } from '../client/utils.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body: {
    message: UIMessage;
    id: string;
    parentMessageId: string | null;
  } = await req.json();

  console.dir(body, { depth: null });

  const { message: userMessage, id, parentMessageId } = body;

  let chat = await getChat(id);

  if (!userMessage) {
    return new Response('No messages provided', { status: 400 });
  }

  if (userMessage.role !== 'user') {
    return new Response('Last message must be from the user', {
      status: 400,
    });
  }

  if (!chat) {
    const newChat = await createChat(id, userMessage);
    chat = newChat;
  } else {
    const newMessage = await addMessage({
      chatId: id,
      message: userMessage,
      parentMessageId,
    });

    chat.messageMap[newMessage.id] = newMessage;
  }

  const fullMessageHistory: UIMessage[] =
    constructMessageHistoryFromMessageMap(
      userMessage.id,
      chat.messageMap,
    );

  console.dir(fullMessageHistory, { depth: null });

  const result = streamText({
    model: google('gemini-2.0-flash-001'),
    messages: convertToModelMessages(fullMessageHistory),
  });

  return result.toUIMessageStreamResponse({
    generateMessageId: () => crypto.randomUUID(),
    onFinish: async (opts) => {
      await addMessage({
        chatId: id,
        message: opts.responseMessage,
        parentMessageId: userMessage.id,
      });
    },
  });
};
