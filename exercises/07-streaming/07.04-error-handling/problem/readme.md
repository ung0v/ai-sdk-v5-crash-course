One incredibly important part of streaming is handling errors. There are many, many different things that can go wrong in the AI SDK - and the way it handles errors is really nice.

Because we are streaming to the front end, if there's ever an error that happens in the stream, then it will simply stream that error to the front end. However, you may want to show a nicer error message than the AI SDK provides by default.

## The Setup

I've set up some demo code here that creates a UI message stream that immediately throws a retry error. This mimics what would happen if `streamText` errored.

```typescript
import { createUIMessageStream, RetryError } from 'ai';

const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    throw new RetryError({
      errors: [new Error('An error occurred')],
      message: 'Maximum retries exceeded',
      reason: 'maxRetriesExceeded',
    });
  },
  // ...
});
```

## The `onError` Handler

Any error that happens inside this `execute` function gets bubbled up to this `onError` handler. And here's where we see our first TODO. It's to check if the error is a `RetryError` using `RetryError.isInstance`, and if it is, we're going to return a message that tells the user to try again.

```typescript
onError(error) {
  // TODO: Check if the error is a RetryError using:
  // RetryError.isInstance(error)
  if (TODO) {
    // TODO: If it is, return a message that tells the user to try again
    return TODO;
  }

  // TODO: Return a default message if the error is not a RetryError
  return TODO;
}
```

If we can't identify the error using `RetryError.isInstance`, then we're going to return a default message if the error is not a retry error. Something like "an unknown error occurred."

## The Frontend

Once that's all hooked up, it's now time to actually show it in the front end. Here's the [`App` component](./client/root.tsx):

```tsx
const App = () => {
  // TODO: Destructure the error property returned from the useChat hook
  const { messages, sendMessage } = useChat({});

  const [input, setInput] = useState(
    `What's the capital of France?`,
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      {/* TODO: Show an error message if the error exists */}
      {TODO}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
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
```

Our first job is to go into `useChat` and destructure out the property of `error` here. This error is going to be an error object which has a message on it.

We have a component below called `ErrorMessage` which will just show the message with a nice little lucid icon:

```tsx
const ErrorMessage = ({ error }: { error: Error }) => {
  return (
    <div className="flex items-center gap-2 p-3 mb-4 text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg">
      <AlertCircle className="size-5 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};
```

So your job is to show the error message if the error exists. And I think under the messages is a decent place for it.

Once that's done, you should be able to run the code and send any message to the back end and it will immediately show an error message. Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Complete the `onError` handler in the API chat.ts file:
  - Replace the first TODO with `RetryError.isInstance(error)`
  - For the second TODO, return a user-friendly message like `"Please try again later."`
  - For the third TODO, return a generic message like `"An unknown error occurred."`

- [ ] Update the App component to handle errors:
  - Destructure the `error` property from the `useChat()` hook
  - Replace the TODO in the JSX with conditional rendering for the ErrorMessage component like `{error && <ErrorMessage error={error} />}`

- [ ] Test your implementation:
  - Run the exercise with `pnpm run exercise`
  - Open localhost:3000 in your browser
  - Send any message to the backend
  - Verify that you see a custom error message displayed
