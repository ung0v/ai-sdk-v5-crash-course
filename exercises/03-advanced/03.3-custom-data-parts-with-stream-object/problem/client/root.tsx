import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyMessage } from '../api/chat.ts';

const App = () => {
  const { messages, sendMessage } = useChat<MyMessage>({});

  const [input, setInput] = useState(``);

  // TODO: Update this to handle the new
  // data-suggestions part
  const latestSuggestion = messages[
    messages.length - 1
  ]?.parts.find((part) => part.type === 'data-suggestion')?.data;

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
        // TODO: Update this to handle the new
        // data-suggestions part
        suggestion={
          messages.length === 0
            ? 'What is the capital of France?'
            : latestSuggestion
        }
        input={input}
        onChange={(text) => setInput(text)}
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
root.render(<App />);
