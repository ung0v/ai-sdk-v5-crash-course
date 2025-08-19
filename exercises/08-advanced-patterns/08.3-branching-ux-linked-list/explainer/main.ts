import type { UIMessage } from 'ai';
import {
  constructMessageHistoryFromMessageMap,
  constructReversedMessageMap,
  type DBMessage,
} from './utils.ts';
import { styleText } from 'util';

// SETUP

const messageMap: Record<string, DBMessage> = {};

const createMessage = async (
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

/** PLAYGROUND ***************************************************** */

/**
 * Try changing the text of the messages to see how the message history changes
 */

// First branch
const message1 = await createMessage(
  null,
  'user',
  'Hello, how are you doing today?',
);
const message2 = await createMessage(
  message1.id,
  'assistant',
  'I am doing well, thank you!',
);
const message3 = await createMessage(
  message2.id,
  'user',
  'What is your name?',
);
const message4 = await createMessage(
  message3.id,
  'assistant',
  'My name is John Doe.',
);

// Alternative branch
const message3Alternative = await createMessage(
  message2.id,
  'user',
  'What year is it in your world?',
);
const message4Alternative = await createMessage(
  message3Alternative.id,
  'assistant',
  'The year is 2025.',
);

/**
 * Change this to see the different branches
 *
 * null
 * message1.id
 * message2.id
 * message3.id
 * message4.id
 * message3Alternative.id
 * message4Alternative.id
 */
const ENTRYPOINT_MESSAGE_ID: string | null = message1.id;

/** PLAYGROUND END ************************************************** */

// Create a reversed message map for efficient lookups
const reversedMessageMap =
  constructReversedMessageMap(messageMap);

console.dir(messageMap, { depth: null });

// Create the entire message history, using the entrypoint message id
const messageHistory = constructMessageHistoryFromMessageMap(
  ENTRYPOINT_MESSAGE_ID,
  messageMap,
  reversedMessageMap,
);

for (const message of messageHistory) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  console.log(
    styleText('dim', message.role.padStart(9)) + '  ' + text,
  );
}
