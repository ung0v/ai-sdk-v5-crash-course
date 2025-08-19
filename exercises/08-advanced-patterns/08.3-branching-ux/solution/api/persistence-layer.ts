import { promises as fs } from 'fs';
import { join } from 'path';
import type { UIMessage } from 'ai';

export namespace DB {
  // Types for our persistence layer
  export interface Chat {
    id: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Message {
    id: string;
    chatId: string;
    role: UIMessage['role'];
    parentMessageId: string | null;
    parts: UIMessage['parts'];
    createdAt: string;
  }

  export interface PersistenceData {
    chats: Record<string, DB.Chat>;
    messages: Record<string, DB.Message>;
  }
}

const DEFAULT_PERSISTENCE_DATA: DB.PersistenceData = {
  chats: {},
  messages: {},
};

// File path for storing the data
const DB_FILE_PATH = join(
  process.cwd(),
  'data',
  'db.local.json',
);

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  const dataDir = join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      DB_FILE_PATH,
      JSON.stringify(DEFAULT_PERSISTENCE_DATA, null, 2),
      'utf-8',
    );
  }
}

export async function loadData(): Promise<DB.PersistenceData> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_PERSISTENCE_DATA;
  }
}

/**
 * Load all chats from the JSON file
 */
export async function loadChats(): Promise<DB.Chat[]> {
  const data = await loadData();
  return Object.values(data.chats) || [];
}

/**
 * Save all chats to the JSON file
 */
async function modifyDatabase(
  modify: (data: DB.PersistenceData) => void,
): Promise<DB.PersistenceData> {
  await ensureDataDirectory();
  const data = await loadData();

  modify(data);

  await fs.writeFile(
    DB_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
  );

  return data;
}

/**
 * Create a new chat
 */
export async function createChat(
  id: string,
  initialMessage: UIMessage,
): Promise<{
  chat: DB.Chat;
  messageMap: Record<string, DB.Message>;
}> {
  const now = new Date().toISOString();

  const newChat: DB.Chat = {
    id,
    createdAt: now,
    updatedAt: now,
  };

  await modifyDatabase((data) => {
    if (data.chats[id]) {
      throw new Error('Chat already exists');
    }
    if (data.messages[initialMessage.id]) {
      throw new Error('Message already exists');
    }

    data.chats[id] = newChat;

    data.messages[initialMessage.id] = {
      id: initialMessage.id,
      chatId: id,
      role: initialMessage.role,
      parentMessageId: null, // No parent message for the first message
      parts: initialMessage.parts,
      createdAt: now,
    };
  });

  const { chat, messageMap } = (await getChat(id))!;
  return { chat, messageMap };
}

/**
 * Get a chat by ID
 */
export async function getChat(chatId: string): Promise<{
  chat: DB.Chat;
  messageMap: Record<string, DB.Message>;
} | null> {
  const data = await loadData();
  const chat = data.chats[chatId];
  if (!chat) {
    return null;
  }

  const messageMap = Object.fromEntries(
    Object.values(data.messages)
      .filter((message) => message.chatId === chatId)
      .map((message) => [message.id, message]),
  );

  return { chat, messageMap };
}

/**
 * Update a chat's messages
 */
export async function addMessage(opts: {
  chatId: string;
  message: UIMessage;
  parentMessageId: string | null;
}): Promise<DB.Message> {
  const data = await loadData();

  if (!data.chats[opts.chatId]) {
    throw new Error('Chat not found');
  }

  const updatedData = await modifyDatabase((data) => {
    if (data.messages[opts.message.id]) {
      throw new Error('Message already exists');
    }
    data.messages[opts.message.id] = {
      id: opts.message.id,
      chatId: opts.chatId,
      role: opts.message.role,
      parentMessageId: opts.parentMessageId,
      parts: opts.message.parts,
      createdAt: new Date().toISOString(),
    };
  });

  return updatedData.messages[opts.message.id]!;
}

/**
 * Delete a chat
 */
export async function deleteChat(
  chatId: string,
): Promise<boolean> {
  const data = await loadData();

  if (!data.chats[chatId]) {
    return false; // Chat not found
  }

  await modifyDatabase((data) => {
    delete data.chats[chatId];
  });

  return true;
}
