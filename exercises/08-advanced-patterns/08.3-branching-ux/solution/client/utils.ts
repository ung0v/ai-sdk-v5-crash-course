import type { DB } from '../api/persistence-layer.ts';

export const DEFAULT_ROOT_MESSAGE_ID = 'root';

export const constructReversedMessageMap = (
  messageMap: Record<string, DB.Message>,
): Partial<Record<string, DB.Message[]>> => {
  return Object.groupBy(
    Object.values(messageMap).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    ),
    (m) => m.parentMessageId ?? DEFAULT_ROOT_MESSAGE_ID,
  );
};

export const constructMessageHistoryFromMessageMap = (
  initialMessageId: string | null,
  messageMap: Record<string, DB.Message>,
  reversedMessageMap: Partial<Record<string, DB.Message[]>>,
): DB.Message[] => {
  const finalMessages: DB.Message[] = [];

  let parentMessageId: string | null = initialMessageId;

  while (parentMessageId) {
    const message: DB.Message | undefined =
      messageMap[parentMessageId];

    if (message) {
      finalMessages.unshift(message);
      parentMessageId = message.parentMessageId;
    } else {
      break;
    }
  }

  let childMessageId: string =
    initialMessageId ?? DEFAULT_ROOT_MESSAGE_ID;

  while (childMessageId) {
    const mostRecentChildMessage =
      reversedMessageMap[childMessageId]?.[0];

    if (mostRecentChildMessage) {
      childMessageId = mostRecentChildMessage.id;

      finalMessages.push(mostRecentChildMessage);
    } else {
      break;
    }
  }

  return finalMessages;
};
