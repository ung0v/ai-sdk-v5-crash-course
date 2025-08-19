import { useChat } from '@ai-sdk/react';
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React, {
  startTransition,
  useEffect,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  useNavigate,
  useSearchParams,
} from 'react-router';
import type { DB } from '../api/persistence-layer.ts';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  constructMessageHistoryFromMessageMap,
  constructReversedMessageMap,
  DEFAULT_ROOT_MESSAGE_ID,
} from './utils.ts';

const queryClient = new QueryClient();

type CommonState = {
  mainInput: string;
};

type State = (
  | {
      status: 'has-chat-id-in-search-params';
    }
  | {
      /**
       * When we have no chat id in the search params,
       * we store the chat id in the state
       */
      status: 'no-chat-id-in-search-params';
      backupChatId: string;
    }
  | {
      status: 'editing-message';
      editingMessageId: string;
    }
) &
  CommonState;

/**
 * We need complete control over when useChat's cache gets cleared.
 *
 * For that, we use a random UUID as the id for the useChat hook.
 *
 * We then clear the cache by setting a new random UUID.
 *
 * This way, we can control when the cache gets cleared.
 */
const useChatCacheClearer = () => {
  const [id, setId] = useState(() => crypto.randomUUID());

  return {
    hash: id,
    clear: () => {
      /**
       * We wrap this in requestIdleCallback so that we can
       * call it after the current event loop has finished.
       *
       * This means you can call it after navigate() and it
       * will be guaranteed to be called after the navigation
       * has completed - meaning the new chat id is set.
       */
      requestIdleCallback(() => {
        setId(crypto.randomUUID());
      });
    },
  };
};

const DEFAULT_CHAT_INPUT = `Who's the best football player in the world?`;

const App = () => {
  const useChatCache = useChatCacheClearer();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const chatIdFromSearchParams = searchParams.get('chatId');

  /**
   * We're storing the message id in the state so that we can
   * construct the message history from the message map.
   */
  const messageIdFromSearchParams =
    searchParams.get('messageId');

  const { data } = useSuspenseQuery({
    queryKey: ['chat', chatIdFromSearchParams],
    staleTime: Infinity,
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

  const reversedMessageMap = constructReversedMessageMap(
    data?.messageMap ?? {},
  );

  const initialMessages = constructMessageHistoryFromMessageMap(
    messageIdFromSearchParams,
    data?.messageMap ?? {},
    reversedMessageMap,
  );

  const { messages, sendMessage, setMessages } =
    useChat<UIMessage>({
      id: useChatCache.hash,
      messages: initialMessages,
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

  // Keep the message map in sync with the messages
  useEffect(() => {
    const messageMap = data?.messageMap ?? {};

    messages.forEach((message, index) => {
      const previousMessage = messages[index - 1];

      messageMap[message.id] = {
        ...message,
        chatId,
        createdAt:
          data?.messageMap?.[message.id]?.createdAt ??
          new Date().toISOString(),
        parentMessageId: previousMessage?.id ?? null,
      };
    });

    queryClient.setQueryData(['chat', chatIdFromSearchParams], {
      messageMap,
    });
  }, [messages]);

  const [state, setState] = useState<State>(
    chatIdFromSearchParams
      ? {
          mainInput: DEFAULT_CHAT_INPUT,
          status: 'has-chat-id-in-search-params',
        }
      : {
          mainInput: DEFAULT_CHAT_INPUT,
          status: 'no-chat-id-in-search-params',
          backupChatId: crypto.randomUUID(),
        },
  );

  const chatId =
    state.status === 'no-chat-id-in-search-params'
      ? state.backupChatId
      : chatIdFromSearchParams!;

  const sendMessageWithExtraData = (opts: {
    message: string;
    parentMessageId: string | null;
  }) => {
    sendMessage(
      {
        text: opts.message,
      },
      {
        body: {
          id: chatId,
          parentMessageId: opts.parentMessageId,
        },
      },
    );
  };

  return (
    <Wrapper>
      {messages.map((message, index, array) => {
        const prevMessage = array[index - 1];

        const allMessagesAtThisStage = (
          reversedMessageMap[
            prevMessage?.id ?? DEFAULT_ROOT_MESSAGE_ID
          ] ?? [message]
        ).toReversed();

        const messageIndexWithinAllMessagesAtThisStage =
          allMessagesAtThisStage.findIndex(
            (m) => m.id === message.id,
          );

        const previousMessageAttemptId =
          allMessagesAtThisStage[
            messageIndexWithinAllMessagesAtThisStage - 1
          ]?.id;

        const nextMessageAttemptId =
          allMessagesAtThisStage[
            messageIndexWithinAllMessagesAtThisStage + 1
          ]?.id;

        return (
          <Message
            onPressPrevious={() => {
              navigate(
                `/?chatId=${chatIdFromSearchParams}&messageId=${previousMessageAttemptId}`,
              );
              useChatCache.clear();
            }}
            onPressNext={() => {
              navigate(
                `/?chatId=${chatIdFromSearchParams}&messageId=${nextMessageAttemptId}`,
              );
              useChatCache.clear();
            }}
            messageIndex={
              messageIndexWithinAllMessagesAtThisStage
            }
            allMessagesCount={allMessagesAtThisStage.length}
            key={message.id}
            role={message.role}
            parts={message.parts}
            onPressEdit={() => {
              setState({
                ...state,
                status: 'editing-message',
                editingMessageId: message.id,
              });
            }}
            onEditSubmit={(editedText) => {
              setMessages(messages.slice(0, index));
              sendMessageWithExtraData({
                message: editedText,
                parentMessageId: prevMessage?.id ?? null,
              });
              setState({
                status: 'has-chat-id-in-search-params',
                mainInput: state.mainInput,
              });
            }}
            isEditing={
              state.status === 'editing-message' &&
              state.editingMessageId === message.id
            }
          />
        );
      })}
      <ChatInput
        input={state.mainInput}
        onChange={(e) =>
          setState({ ...state, mainInput: e.target.value })
        }
        onSubmit={(e) => {
          e.preventDefault();

          // Send the message to /api/chat
          sendMessageWithExtraData({
            message: state.mainInput,
            parentMessageId:
              messages[messages.length - 1]?.id ?? null,
          });

          // If we currently have no chat, we need to create a new one
          if (state.status === 'no-chat-id-in-search-params') {
            setSearchParams({
              chatId: state.backupChatId,
            });
          }

          // Reset the editing state
          setState({
            status: 'has-chat-id-in-search-params',
            mainInput: '',
          });
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
);
