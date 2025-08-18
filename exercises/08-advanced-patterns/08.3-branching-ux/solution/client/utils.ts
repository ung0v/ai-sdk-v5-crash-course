import type { DB } from '../api/persistence-layer.ts';

export const constructMessageHistoryFromMessageMap = (
  lastMessageId: string | null,
  messageMap: Record<string, DB.Message>,
): DB.Message[] => {
  if (!lastMessageId) {
    return [];
  }

  const finalMessages: DB.Message[] = [];

  let currentMessageId: string | null = lastMessageId;

  while (currentMessageId) {
    const message: DB.Message | undefined =
      messageMap[currentMessageId];

    if (message) {
      finalMessages.unshift(message);
      currentMessageId = message.parentMessageId;
    } else {
      break;
    }
  }

  return finalMessages;
};
