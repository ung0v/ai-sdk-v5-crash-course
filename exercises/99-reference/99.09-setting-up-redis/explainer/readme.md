The absolute simplest way to get started with Redis is to use a third-party provider. There are a bunch of third-party providers that will host your Redis instance on the cloud for you. You will then get an environment variable which will point to that cloud instance. And a bunch of these places also have free tiers too.

If you want a recommendation from me, then I would go for [Upstash](https://upstash.com/pricing/redis). Otherwise, you can set up Redis locally using [Docker Desktop](https://docs.docker.com/desktop/).

Here's a list of Redis providers with free tiers:

- [Upstash](https://upstash.com/pricing/redis) - Serverless Redis with 256MB free tier
- [Redis Cloud](https://redis.io/try-free/) - Official Redis with 30MB free tier
- [DigitalOcean](https://www.digitalocean.com/products/managed-databases-valkey) - Managed Valkey (Redis-compatible)
- [AWS ElastiCache](https://aws.amazon.com/elasticache/) - Through AWS Console
- [Google Cloud Memorystore](https://cloud.google.com/memorystore) - Through Google Cloud Console
- [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/) - Through Azure Portal

For local development with Docker:

- [Docker Desktop](https://docs.docker.com/desktop/)
- [How to run Redis in Docker](https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/)

Once you've got your Redis instance set up, you'll need to add the `REDIS_URL` to your environment variables. The exercise is using a simple Redis client to test the connection.

```ts
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
```

After you've added your Redis URL to your `.env` file, you should be able to run the exercise. When successful, you'll see a message confirming "Redis client connected! All looks good. You can consider the exercise complete."

Nice work, and I will see you in the next one.

## Steps To Complete

- [ ] Choose a Redis provider (Upstash recommended) or set up Redis locally with Docker
  - Review the provided list of Redis providers with free tiers
  - Or follow the Docker Desktop setup instructions

- [ ] Get your Redis connection URL from your chosen provider

- [ ] Add the Redis URL to your `.env` file as `REDIS_URL="your_connection_string_here"`

- [ ] Run the exercise
  - When successful, you should see the message: "Redis client connected! All looks good."
