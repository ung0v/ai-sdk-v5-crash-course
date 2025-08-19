In these few exercises, we're going to look at how to build one of the most useful, commonly requested UX features of AI applications: branching messages. That is the ability to go back and rewrite a previous message.

## Creating The Message History

I've set up a REPL here so that we can play with this. The core of the idea is to use a linked list data structure.

In the code, I have a `createMessage` function, which takes the `parentMessageId` as its first parameter. This is the previous message in the history.

By calling this a few times, we can create a message history:

```ts
const message1 = await createMessage(
  null,
  'user',
  'Hello, how are you doing today?',
);
const message2 = await createMessage(
  message1.id,
  'assistant',
  'I am doing well, thank you!',
);
const message3 = await createMessage(
  message2.id,
  'user',
  `I'm an original message. OG. Sweet.`,
);
const message4 = await createMessage(
  message3.id,
  'assistant',
  'Great, how enjoyable. Originality is key.',
);
```

Behind the scenes, these messages are being saved in a database, which is inside [`db.ts`](./db.ts).

In the rest of this file, we're going to call a function called `getMessageHistory`, which takes an `entrypointMessageId`. This is the message ID that we're going to construct the message history from. Finally, we're just going to log that message history to the console:

```ts
for (const message of messageHistory) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  console.log(
    styleText('dim', message.role.padStart(9)) + '  ' + text,
  );
}
```

## Trying It Out

Let's change the entry point message ID to, let's say, `message4.id`:

```ts
const ENTRYPOINT_MESSAGE_ID = message4.id;
```

When we run the exercise, we'll see the message history in the terminal:

```
     user  Hello, how are you doing today?
assistant  I am doing well, thank you!
     user  I'm an original message. OG. Sweet.
assistant  Great, how enjoyable. Originality is key.
```

In fact, we can pass in any of the message IDs and we'll get back the same set of messages because there's currently no branching going on.

## Adding Branching

What if we create an alternative to message three? We can create a new message that branches off from message two:

```ts
// Alternative branch
const message3Alternative = await createMessage(
  message2.id,
  'user',
  `I'm an alternative message! Whoooooo`,
);
const message4Alternative = await createMessage(
  message3Alternative.id,
  'assistant',
  'Good for you pal. Counter-cultural.',
);
```

Now we've got a choice. We can either use `message3Alternative.id`, which will yield the new message history with "I'm an alternative message!":

```ts
const ENTRYPOINT_MESSAGE_ID = message3Alternative.id;
```

Terminal output:

```
     user  Hello, how are you doing today?
assistant  I am doing well, thank you!
     user  I'm an alternative message! Whoooooo
assistant  Good for you pal. Counter-cultural.
```

Or we can go for the original branch with `message3.id` to get back the original messages:

```ts
const ENTRYPOINT_MESSAGE_ID = message3.id;
```

Terminal output:

```
     user  Hello, how are you doing today?
assistant  I am doing well, thank you!
     user  I'm an original message. OG. Sweet.
assistant  Great, how enjoyable. Originality is key.
```

As we can see, we've managed to model these branches in a very simple data structure.

## Choosing Most Recently Created Branches

There are a couple more cases to understand. What happens if we use `message1.id`? Well, starting from `message1` will go through `message2`, and then we'll end up with a branch where it can choose between `message3` or `message3Alternative`:

```ts
const ENTRYPOINT_MESSAGE_ID = message1.id;
```

Terminal output:

```
     user  Hello, how are you doing today?
assistant  I am doing well, thank you!
     user  I'm an alternative message! Whoooooo
assistant  Good for you pal. Counter-cultural.
```

It chooses the alternative message. That's because in the way this algorithm is built, it chooses the most _recently created_ message.

## Passing `null` As The Entrypoint Message ID

What happens if we pass `null` into this entry point? Well, if we pass `null` as the parent message ID, it indicates that the message doesn't have any parents—in other words, it's the first message. So in that case, it's going to start with the first message and follow the same pattern, ending with our alternative message.

```ts
const ENTRYPOINT_MESSAGE_ID = null;
```

Terminal output:

```
     user  Hello, how are you doing today?
assistant  I am doing well, thank you!
     user  I'm an alternative message! Whoooooo
assistant  Good for you pal. Counter-cultural.
```

So as you can see, we have two branches here, and we can select those branches by selecting any message on that branch.

## Reference Material

For many of you, this is all you'll need to know about this setup. But for folks who want to dive deeper, I provided some seriously in-depth reference material on how each of these algorithms work in the utility files.

I recommend you mess about with this file, creating a whole bunch of messages, trying to create lots of forked layers—a really gnarly, strange branching tree—and see what the message history looks like when you choose different entry points on that tree. Understanding how this works is key to understanding the rest of it.

The main data structures being used are:

1. A message map (`messageMap`) that stores messages by their ID
2. A reversed message map that groups messages by their parent ID
3. A linked list structure where each message points to its parent

The `constructMessageHistoryFromMessageMap` function handles traversing these structures to build the message history from a given entry point.

## Steps To Complete

- [ ] Study the `main.ts` file to understand how message branching works
  - Create different message branches
  - Try different entry point message IDs
  - Try passing `null` as the entrypoint message ID

- [ ] Examine the `db.ts` file to understand the message storage structure
  - Look at how the linked list is implemented
  - Understand how messages are stored in the `messageMap`

- [ ] Explore the `utils.ts` file to understand the algorithms
  - Study `constructReversedMessageMap` to understand how the reversed message map is constructed
  - Study `constructMessageHistoryFromMessageMap` to understand how the message history is constructed
  - Study `getBranchesOfMessage` to understand how the branches of a message are constructed

- [ ] Experiment with creating complex branching structures
  - Create multiple levels of branches
  - Try different entry points on your branch tree
