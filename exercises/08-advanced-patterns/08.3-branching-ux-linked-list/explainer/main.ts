import { styleText } from 'util';
import { createMessage, getMessageHistory } from './db.ts';

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
  `I'm an original message. OG. Sweet.`,
);
const message4 = await createMessage(
  message3.id,
  'assistant',
  'Great, how enjoyable. Originality is key.',
);

// Alternative branch
const message3Alternative = await createMessage(
  message2.id,
  'user',
  `I'm an alternative message! Whoooooo`,
);
const message4Alternative = await createMessage(
  message3Alternative.id,
  'assistant',
  'Good for you pal. Counter-cultural.',
);

const ENTRYPOINT_MESSAGE_ID: string | null = null;

const messageHistory = getMessageHistory(ENTRYPOINT_MESSAGE_ID);

for (const message of messageHistory) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  console.log(
    styleText('dim', message.role.padStart(9)) + '  ' + text,
  );
}
