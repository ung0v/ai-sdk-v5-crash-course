import { useChat, type UIMessage } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import { BrowserRouter, useSearchParams } from 'react-router';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const chatId =
    searchParams.get('chatId') || crypto.randomUUID();

  const { messages, sendMessage } = useChat({
    id: chatId,
  });

  const [input, setInput] = useState('Hello, how are you?');

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
          sendMessage({
            text: input,
          });
          setInput('');
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
