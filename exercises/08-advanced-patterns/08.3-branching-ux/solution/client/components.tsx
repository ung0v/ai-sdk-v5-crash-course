import type { UIDataTypes, UIMessagePart, UITools } from 'ai';
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
}: {
  role: string;
  parts: UIMessagePart<UIDataTypes, UITools>[];
  onPressEdit: () => void;
  onEditSubmit: (editedText: string) => void;
  isEditing: boolean;
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
            <button
              onClick={onPressEdit}
              className="text-sm text-zinc-200 bg-gray-700 px-3 py-1 rounded-md"
            >
              Edit
            </button>
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
