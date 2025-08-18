import { useChat } from '@ai-sdk/react';
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useSearchParams } from 'react-router';
import type { DB } from '../api/persistence-layer.ts';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import { DefaultChatTransport } from 'ai';
import { constructMessageHistoryFromMessageMap } from './utils.ts';

const App = () => {
  const [backupChatId, setBackupChatId] = useState(
    crypto.randomUUID(),
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const chatIdFromSearchParams = searchParams.get('chatId');

  const { data } = useSuspenseQuery({
    queryKey: ['chat', chatIdFromSearchParams],
    queryFn: () => {
      if (!chatIdFromSearchParams) {
        return null;
      }

      return fetch(
        `/api/get-chat?chatId=${chatIdFromSearchParams}`,
      ).then(
        (
          res,
        ): Promise<{
          chat: DB.Chat;
          messageMap: Record<string, DB.Message>;
        }> => res.json(),
      );
    },
  });

  const mostRecentMessageIdInHistory =
    Object.values(data?.messageMap ?? {}).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )[0]?.id ?? null;

  const { messages, sendMessage } = useChat({
    id: chatIdFromSearchParams ?? backupChatId,
    messages: constructMessageHistoryFromMessageMap(
      mostRecentMessageIdInHistory,
      data?.messageMap ?? {},
    ),
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: (opts) => {
        const lastMessage =
          opts.messages[opts.messages.length - 1];

        return {
          body: {
            ...opts.body,
            message: lastMessage,
          },
          api: '/api/chat',
        };
      },
    }),
  });

  const [input, setInput] = useState(
    `Who's the best football player in the world?`,
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(
            {
              text: input,
            },
            {
              body: {
                id: chatIdFromSearchParams ?? backupChatId,
                parentMessageId:
                  messages[messages.length - 1]?.id ?? null,
              },
            },
          );
          setInput('');

          if (chatIdFromSearchParams) {
            return;
          }

          // Refresh the backup chat id
          setBackupChatId(crypto.randomUUID());
          setSearchParams({ chatId: backupChatId });
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
);
