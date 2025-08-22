import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  console.error('REDIS_URL is not set in .env!');
  process.exit(1);
}

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
  client.destroy();
});

await client.connect();

await client.ping();

console.log(
  'Redis client connected! All looks good. You can consider the exercise complete.',
);

client.destroy();
