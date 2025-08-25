import type { UIDataTypes, UIMessagePart, UITools } from 'ai';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { MyMessage } from '../api/chat.ts';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch">
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
  onSelectModel,
}: {
  role: string;
  parts: MyMessage['parts'];
  onSelectModel: (partId: string) => void;
}) => {
  const prefix = role === 'user' ? 'User: ' : 'AI: ';
  return (
    <div className="my-6">
      {parts.map((part) => {
        if (part.type === 'text') {
          return (
            <div className="prose prose-invert">
              <ReactMarkdown>{prefix + part.text}</ReactMarkdown>
            </div>
          );
        }
      })}
      <div className="flex gap-4">
        {parts.map((part) => {
          if (part.type === 'data-output') {
            return (
              <div key={part.id} className="flex-1">
                <span className="block text-sm text-gray-500 mb-1">
                  {part.data.model}
                </span>
                <div className="prose prose-invert">
                  <ReactMarkdown>{part.data.text}</ReactMarkdown>
                  <button
                    className="bg-gray-700 text-white px-2 py-1 rounded"
                    onClick={() => onSelectModel(part.id!)}
                  >
                    Select
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export const ChatInput = ({
  disabled,
  input,
  onChange,
  onSubmit,
  placeholder,
}: {
  disabled: boolean;
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
}) => (
  <form onSubmit={onSubmit}>
    <input
      className="fixed bottom-0 max-w-2xl w-full p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800"
      value={input}
      placeholder={placeholder}
      onChange={onChange}
      autoFocus
      disabled={disabled}
    />
  </form>
);
