import { useChat } from '@ai-sdk/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { type UIMessage } from 'ai';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  useNavigate,
  useSearchParams,
} from 'react-router';
import type { DB } from '../api/persistence-layer.ts';
import { ChatInput, Message, Wrapper } from './components.tsx';
import { sendOnlyLastMessageTransport } from './send-only-last-message-transport.ts';
import './tailwind.css';
import { useChatCacheManager } from './use-chat-cache-manager.ts';
import { useFetchChat } from './use-fetch-chat.ts';
import {
  constructMessageHistoryFromMessageMap,
  constructReversedMessageMap,
  getBranchesOfMessage,
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

const DEFAULT_CHAT_INPUT = `Who's the best football player in the world?`;

const App = () => {
  const useChatCache = useChatCacheManager();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const chatIdFromSearchParams = searchParams.get('chatId');

  /**
   * We're storing the message id in the state so that we can
   * construct the message history from the message map.
   */
  const messageIdFromSearchParams =
    searchParams.get('messageId');

  const data = useFetchChat(chatIdFromSearchParams);

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
      transport: sendOnlyLastMessageTransport,
    });

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

  useKeepMessageMapInSync({
    messageMap: data?.messageMap ?? {},
    messages,
    chatId,
  });

  const sendMessageWithBody = (opts: {
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

        const allBranches = getBranchesOfMessage({
          message,
          reversedMessageMap,
          parentMessageId: prevMessage?.id ?? null,
        })
          // We want to reverse them so that the most
          // recent message (let's say 5) displays
          // at the end of the array (5/5)
          .toReversed();

        const branchIndex = allBranches.findIndex(
          (m) => m.id === message.id,
        );

        const previousBranchId =
          allBranches[branchIndex - 1]?.id;

        const nextBranchId = allBranches[branchIndex + 1]?.id;

        return (
          <Message
            onPressPreviousBranch={() => {
              navigate(
                `/?chatId=${chatIdFromSearchParams}&messageId=${previousBranchId}`,
              );
              useChatCache.clear();
            }}
            onPressNextBranch={() => {
              navigate(
                `/?chatId=${chatIdFromSearchParams}&messageId=${nextBranchId}`,
              );
              useChatCache.clear();
            }}
            branchIndex={branchIndex}
            allBranchesCount={allBranches.length}
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
              sendMessageWithBody({
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
          sendMessageWithBody({
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

/**
 * Since we have two stores of state, we need to keep them in sync.
 *
 * We do this by keeping the one which changes less frequently (React Query)
 * in sync with the one which changes more frequently (useChat).
 *
 * Ideally we would store these in a single store - but since both
 * stores are in third-party libraries, we need to keep them in sync
 * manually.
 */
const useKeepMessageMapInSync = (opts: {
  messageMap: Record<string, DB.Message>;
  messages: UIMessage[];
  chatId: string;
}) => {
  // Keep the message map in sync with the messages
  useEffect(() => {
    const messageMap = opts.messageMap ?? {};

    opts.messages.forEach((message, index) => {
      const previousMessage = opts.messages[index - 1];

      messageMap[message.id] = {
        ...message,
        chatId: opts.chatId,
        createdAt:
          messageMap?.[message.id]?.createdAt ??
          new Date().toISOString(),
        parentMessageId: previousMessage?.id ?? null,
      };
    });

    queryClient.setQueryData(['chat', opts.chatId], {
      messageMap,
    });
  }, [
    // Will only re-run when messages changes length
    opts.messages.length,
  ]);
};
