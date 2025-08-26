import type { UIMessage } from 'ai';

export const formatMessageHistory = (messages: UIMessage[]) => {
  return messages
    .map((message) => {
      return `${message.role}: ${message.parts
        .map((part) => {
          if (part.type === 'text') {
            return part.text;
          }

          return '';
        })
        .join('')}`;
    })
    .join('\n');
};

export const WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM = `You are writing a Slack message for a user based on the conversation history. Only return the Slack message, no other text.`;

export const CHECK_FOR_CLARIFYING_QUESTIONS_SYSTEM = `You are gathering information from the user to help you write a Slack message.

You respond in a friendly tone of voice.

<rules>
  - You'll need to clarify any information not obvious from the conversation history. This includes names, dates, company names, addresses, email addresses, etc.
  - Identify missing information, and ask for it in a single question.
  - Do not ask for advice about the draft.
  - If we have all the basic information we need, do not ask for more information.
</rules>

Figure out what information might be required to write the Slack message, then ask for it.
`;

export type MyMessage = UIMessage<
  unknown,
  {
    'clarifying-questions-reasoning': string;
  }
>;
