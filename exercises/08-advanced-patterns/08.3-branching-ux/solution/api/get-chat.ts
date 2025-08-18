import { getChat } from './persistence-layer.ts';

export const GET = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('No chatId provided', { status: 400 });
  }

  const chat = await getChat(chatId);

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  return new Response(
    JSON.stringify({
      id: chat.chat.id,
      messageMap: chat.messageMap,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};
