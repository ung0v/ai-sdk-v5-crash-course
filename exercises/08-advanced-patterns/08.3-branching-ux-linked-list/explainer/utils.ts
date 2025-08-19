import type { UIMessage } from 'ai';
import type { DBMessage } from './db.ts';

/**
 * parentMessageId is string | null. We can't use null as a key
 * in an object, so we use a hard-coded string instead.
 */
export const DEFAULT_ROOT_MESSAGE_ID = 'root';

/**
 * Build a map of parent message id to an array of messages
 *
 * In order to be able to efficiently get the branches of a message,
 * we need to be able to quickly get all the messages that have a
 * given parent message id.
 *
 * This map is keyed by the parent message id and the value is an
 * array of messages that have that parent message id.
 */
export const constructReversedMessageMap = (
  messageMap: Record<string, DBMessage>,
): Partial<Record<string, DBMessage[]>> => {
  return Object.groupBy(
    Object.values(messageMap).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    ),
    (m) => m.parentMessageId ?? DEFAULT_ROOT_MESSAGE_ID,
  );
};

/**
 * Construct the message history from the message map and the reversed
 * message map.
 *
 * This is the message history that we display to the user or LLM.
 */
export const constructMessageHistoryFromMessageMap = (
  initialMessageId: string | null,
  messageMap: Record<string, DBMessage>,
  reversedMessageMap: Partial<Record<string, DBMessage[]>>,
): DBMessage[] => {
  const finalMessages: DBMessage[] = [];

  let parentMessageId: string | null = initialMessageId;

  while (parentMessageId) {
    const message: DBMessage | undefined =
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

/**
 * Get the branches of a message
 *
 * We get the branches of a message by getting the messages that have
 * the same parent message id.
 */
export const getBranchesOfMessage = (opts: {
  message: UIMessage;
  reversedMessageMap: Partial<Record<string, DBMessage[]>>;
  parentMessageId: string | null;
}): UIMessage[] => {
  const allBranches =
    opts.reversedMessageMap[
      opts.parentMessageId ?? DEFAULT_ROOT_MESSAGE_ID
    ];

  if (!allBranches) {
    return [opts.message];
  }

  return allBranches;
};
