import { DefaultChatTransport } from 'ai';

export const sendOnlyLastMessageTransport =
  new DefaultChatTransport({
    prepareSendMessagesRequest: (opts) => {
      const lastMessage =
        opts.messages[opts.messages.length - 1];

      return {
        body: {
          ...opts.body,
          message: lastMessage,
        },
      };
    },
  });
