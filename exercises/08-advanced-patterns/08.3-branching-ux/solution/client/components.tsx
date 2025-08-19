import type { UIDataTypes, UIMessagePart, UITools } from 'ai';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
  onPressEdit,
  isEditing,
  onEditSubmit,
  messageIndex,
  allMessagesCount,
  onPressPrevious,
  onPressNext,
}: {
  role: string;
  parts: UIMessagePart<UIDataTypes, UITools>[];
  onPressEdit: () => void;
  onEditSubmit: (editedText: string) => void;
  isEditing: boolean;
  messageIndex: number;
  allMessagesCount: number;
  onPressPrevious: () => void;
  onPressNext: () => void;
}) => {
  const prefix = role === 'user' ? 'User: ' : 'AI: ';

  const text = parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      return '';
    })
    .join('');

  const [editedText, setEditedText] = useState(text);

  useEffect(() => {
    if (!isEditing) {
      setEditedText(text);
    }
  }, [text, isEditing]);

  return (
    <div className="prose prose-invert my-6">
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onEditSubmit(editedText);
          }}
        >
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
            className="bg-gray-800 text-white px-3 py-1 rounded-md w-full block mb-2"
          />
          <button
            type="submit"
            className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Save
          </button>
        </form>
      ) : (
        <div>
          <ReactMarkdown>{prefix + text}</ReactMarkdown>
          {role === 'user' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onPressPrevious}
                  className="text-sm text-zinc-200 px-2 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={messageIndex === 0}
                >
                  <ChevronLeft />
                </button>
                <div className="text-sm text-zinc-200">
                  <span>
                    {messageIndex + 1} / {allMessagesCount}
                  </span>
                </div>
                <button
                  onClick={onPressNext}
                  className="text-sm text-zinc-200 px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    messageIndex === allMessagesCount - 1
                  }
                >
                  <ChevronRight />
                </button>
              </div>
              <button
                onClick={onPressEdit}
                className="text-sm text-zinc-200 bg-gray-700 px-3 py-1 rounded-md"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
  disabled,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}) => (
  <form onSubmit={onSubmit}>
    <input
      className={`fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      value={input}
      placeholder={
        disabled
          ? 'Please handle tool calls first...'
          : 'Say something...'
      }
      onChange={onChange}
      disabled={disabled}
      autoFocus
    />
  </form>
);
