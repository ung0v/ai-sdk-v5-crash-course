import { promises as fs } from 'fs';
import { join } from 'path';
import type { UIMessage } from 'ai';

export namespace DB {
  // Types for our persistence layer
  export interface Chat {
    id: string;
    messages: UIMessage[];
    createdAt: string;
    updatedAt: string;
  }

  export interface Stream {
    id: string;
    chatId: string;
    createdAt: string;
  }

  export interface PersistenceData {
    chats: DB.Chat[];
    streams: DB.Stream[];
  }
}

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
      JSON.stringify({ chats: [], streams: [] }, null, 2),
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
    return { chats: [], streams: [] };
  }
}

/**
 * Load all chats from the JSON file
 */
export async function loadChats(): Promise<DB.Chat[]> {
  const data = await loadData();
  return data.chats || [];
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
  initialMessages: UIMessage[] = [],
): Promise<DB.Chat> {
  const now = new Date().toISOString();

  const newChat: DB.Chat = {
    id,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
  };

  await modifyDatabase((data) => {
    data.chats.push(newChat);
  });

  return newChat;
}

/**
 * Get a chat by ID
 */
export async function getChat(
  chatId: string,
): Promise<DB.Chat | null> {
  const chats = await loadChats();
  return chats.find((chat) => chat.id === chatId) || null;
}

/**
 * Update a chat's messages
 */
export async function appendToChatMessages(
  chatId: string,
  messages: UIMessage[],
): Promise<DB.Chat | null> {
  const chats = await loadChats();
  const chatIndex = chats.findIndex(
    (chat) => chat.id === chatId,
  );

  if (chatIndex === -1) {
    return null;
  }

  const data = await modifyDatabase((data) => {
    data.chats[chatIndex]!.messages = [
      ...data.chats[chatIndex]!.messages,
      ...messages,
    ];
    data.chats[chatIndex]!.updatedAt = new Date().toISOString();
  });

  return data.chats[chatIndex]!;
}

/**
 * Delete a chat
 */
export async function deleteChat(
  chatId: string,
): Promise<boolean> {
  const initialLength = (await loadChats()).length;
  const data = await modifyDatabase((data) => {
    data.chats = data.chats.filter((chat) => chat.id !== chatId);
  });

  if (data.chats.length === initialLength) {
    return false; // Chat not found
  }

  return true;
}

/**
 * Create a new stream
 */
export async function createStream(
  chatId: string,
): Promise<DB.Stream> {
  const now = new Date().toISOString();

  const newStream: DB.Stream = {
    id: crypto.randomUUID(),
    chatId,
    createdAt: now,
  };

  await modifyDatabase((data) => {
    data.streams.push(newStream);
  });

  return newStream;
}

/**
 * Load all streams
 */
async function loadAllStreams(): Promise<DB.Stream[]> {
  const data = await loadData();
  return data.streams || [];
}

export async function loadStreamsByChatId(
  chatId: string,
): Promise<DB.Stream[]> {
  const streams = await loadAllStreams();
  return streams.filter((stream) => stream.chatId === chatId);
}

/**
 * Get a stream by ID
 */
export async function getStream(
  streamId: string,
): Promise<DB.Stream | null> {
  const streams = await loadAllStreams();
  return (
    streams.find((stream) => stream.id === streamId) || null
  );
}
