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
    chats: Record<string, DB.Chat>;
    streams: Record<string, DB.Stream>;
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
      JSON.stringify({ chats: {}, streams: {} }, null, 2),
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
    return { chats: {}, streams: {} };
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
    data.chats[id] = newChat;
  });

  return newChat;
}

/**
 * Get a chat by ID
 */
export async function getChat(
  chatId: string,
): Promise<DB.Chat | null> {
  const data = await loadData();
  return data.chats[chatId] || null;
}

/**
 * Update a chat's messages
 */
export async function appendToChatMessages(
  chatId: string,
  messages: UIMessage[],
): Promise<DB.Chat | null> {
  const data = await loadData();

  if (!data.chats[chatId]) {
    return null;
  }

  const updatedData = await modifyDatabase((data) => {
    data.chats[chatId]!.messages = [
      ...data.chats[chatId]!.messages,
      ...messages,
    ];
    data.chats[chatId]!.updatedAt = new Date().toISOString();
  });

  return updatedData.chats[chatId]!;
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
    data.streams[newStream.id] = newStream;
  });

  return newStream;
}

/**
 * Load all streams
 */
async function loadAllStreams(): Promise<DB.Stream[]> {
  const data = await loadData();
  return Object.values(data.streams) || [];
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
  const data = await loadData();
  return data.streams[streamId] || null;
}
