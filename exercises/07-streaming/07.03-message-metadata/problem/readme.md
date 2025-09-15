In this exercise, we're going to explore adding metadata to messages. This is additional information you want to track about the message that doesn't necessarily fall into the parts category. For instance, we'll never want multiple metadata entries per message - it's just a single piece of information about the message.

In our case, we want to track how long each message takes to generate and then show that to the user. This is useful information, especially for really long-running workflows like deep research.

## Adding Metadata to the Message Type

The plan is to start inside `api/chat.ts` and customize the `UIMessage` type again. The `UIMessage` type has three type parameters, and the first one is metadata. This is where we'll pass our type in - an object with a `duration` property that represents the milliseconds it took to complete streaming the message.

```ts
// TODO: Add the type of the metadata to the object here
// We probably want it to be { duration: number }
export type MyUIMessage = UIMessage<TODO>;
```

## Implementing the Message Metadata Function

Once that's done, we'll implement the `messageMetadata` function in `result.toUIMessageStreamResponse`.

```ts
// TODO: Calculate the start time of the stream
const startTime = TODO;

return result.toUIMessageStreamResponse<MyUIMessage>({
  // TODO: Add the messageMetadata function here
  // If it encounters a 'finish' part, it should return the duration
  // of the stream in milliseconds
  messageMetadata: TODO,
});
```

The `messageMetadata` callback gets called on every single text part, and when we encounter a part with type 'finish' (sent by the AI SDK when message creation is complete), we'll calculate the duration and send that as our message metadata.

We need to capture the start time of the stream so we can calculate how long it took to complete.

Check the [reference material](/exercises/99-reference/99.07-message-metadata/explainer/readme.md) for more information.

## Updating the Frontend Code

In the frontend code, we also need to make changes. We need to update the type for the `metadata` parameter:

```tsx
// problem/client/components.tsx
export const Message = ({
  role,
  parts,
  metadata,
}: {
  role: string;
  parts: MyUIMessage['parts'];
  // TODO: Add a type for the metadata here
  metadata: TODO;
}) => {
```

And finally, we need to pass the actual metadata to the `Message` component.

```tsx
// problem/client/root.tsx
<Message
  key={message.id}
  role={message.role}
  parts={message.parts}
  // TODO: Pass the metadata to the Message component
  metadata={TODO}
/>
```

I've scaffolded out the actual front-end code, so you won't need to do much there. The `formatDuration` function provided will handle displaying the duration nicely, as long as we have `metadata.duration` as a number.

## Steps To Complete

- [ ] Update the `MyUIMessage` type in `api/chat.ts` to include metadata with a duration property
  - Add `{ duration: number }` as the metadata type parameter

- [ ] Initialize the `startTime` variable in `api/chat.ts`
  - Use `Date.now()` to capture the current timestamp when the stream starts

- [ ] Implement the `messageMetadata` function in `toUIMessageStreamResponse`
  - Return the duration when encountering a part with type 'finish'
  - Calculate duration as current time minus start time

- [ ] Update the `metadata` type in the `Message` component
  - Use the same type as defined in `MyUIMessage`

- [ ] Pass the message metadata to the `Message` component in `root.tsx`
  - Simply pass `message.metadata` to the component

- [ ] Test the solution by running the exercise
  - Run `pnpm run exercise`
  - Navigate to localhost:3000
  - Send a message and observe if the duration appears after the AI responds
