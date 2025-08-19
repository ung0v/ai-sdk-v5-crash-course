import type { UIMessage } from 'ai';
import {
  constructMessageHistoryFromMessageMap,
  constructReversedMessageMap,
} from './utils.ts';

export type DBMessage = UIMessage & {
  parentMessageId: string | null;
  createdAt: string;
};

// SETUP

/**
 * We're using a Map to store the messages.
 *
 * The key is the message id and the value is the message.
 *
 * ![](./message-map.png)
 */
export const messageMap: Record<string, DBMessage> = {};

/**
 * We're using a Linked List approach to store
 * the messages.
 *
 * ![](./linked-list.png)
 */
export const createMessage = async (
  parentMessageId: string | null,
  role: 'user' | 'assistant',
  text: string,
) => {
  const id = crypto.randomUUID();

  const message: DBMessage = {
    id,
    role,
    parts: [
      {
        type: 'text',
        text,
      },
    ],
    parentMessageId,
    createdAt: new Date().toISOString(),
  };

  messageMap[id] = message;

  // Simulate a delay to make sure that createdAt is different
  await new Promise((resolve) => setTimeout(resolve, 10));

  return message;
};

export const getMessageHistory = (
  entrypointMessageId: string | null,
) => {
  const reversedMessageMap =
    constructReversedMessageMap(messageMap);

  return constructMessageHistoryFromMessageMap(
    entrypointMessageId,
    messageMap,
    reversedMessageMap,
  );
};
