The eagle-eyed among you may have noticed something a little bit off about our code. We have a `POST` request here where we're taking in some JSON from the body of the request and then just grabbing the messages from that body.

```typescript
const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();
  const { messages } = body;

  // ...
};
```

The issue is that we're not checking that `body.messages` is the right shape. This might lead to all sorts of weird errors in the code below.

It's good practice for any backend function to validate what it's getting from the front end.

We could create an enormous Zod schema here, but UI messages have all sorts of different parts:

- Different tool call shapes
- Various states
- Complex nested structures

This would end up being a huge amount of work to properly validate.

## Using `validateUIMessages`

Fortunately, the AI SDK has a function exported called `validateUIMessages`. This function:

1. Takes in the messages from the body
2. Returns an array of `UIMessage` objects
3. Throws an error if validation fails

Here's how we can implement it:

```typescript
let messages: UIMessage[];

try {
  messages = await validateUIMessages({
    messages: body.messages,
  });
} catch (error) {
  return new Response('Invalid messages', { status: 400 });
}
```

## Testing

You can test this by running the exercise and using the curl commands provided in the [`command.md`](./command.md) file.

Here's an example of an invalid message that doesn't contain any parts:

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{
  "messages": [
    {
      "id": "invalid-message",
      "role": "user"
    }
  ]
}'
```

When we test this, we get an "invalid messages" response back with a 400 status code.

And with a valid message:

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{
  "messages": [
    {
      "id": "valid-message",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "What is the capital of France?"
        }
      ]
    }
  ]
}'
```

Running this executes our application correctly, and we get the data stream coming back.

## Summary

The `validateUIMessages` function is extremely useful if you receive a `UIMessage` array in your API route. It even supports more advanced parts of the AI SDK, via schemas passed in to the function.

Nice work, and I'll see you in the next one.

## Steps To Complete

- [ ] Test your implementation with both valid and invalid message formats
  - Use the curl commands provided in `command.md`
  - Verify that invalid messages return a 400 status
  - Verify that valid messages process correctly
