We saw earlier an intriguing property on the `usage` that we get back from the AI SDK, which was `cachedInputTokens`.

This touches on a really important concept called prompt caching, where model providers actually cache some of the request for you so you pay less on repeat requests.

## Exploring Prompt Caching

I've given you a playground that you can play with to explore prompt caching. There are a few important variables here:

Let's imagine that in a previous request, we have sent these tokens to the cache: "The quick brown fox jumps over the lazy dog." Then in a later request, we're going to send these input tokens - the same thing that we had before and then add a few extra tokens on the end.

```ts
const tokensInCache = tokenize(
  `The quick brown fox jumps over the lazy dog`,
);
const inputTokens = tokenize(
  // NOTE: Change this to change what the input is
  `The quick brown fox jumps over the lazy dog. What a brilliant story.`,
);
```

Below this, I've added some logic that matches what happens in the prompt caching. And below that, we're displaying a nice display of what gets cached and what doesn't.

```ts
let numberOfMatchingTokens = 0;
for (let i = 0; i < inputTokens.length; i++) {
  if (inputTokens[i] === tokensInCache[i]) {
    numberOfMatchingTokens++;
  } else {
    break;
  }
}

// The cached and uncached tokens
const cachedTokens = tokensInCache.slice(
  0,
  numberOfMatchingTokens,
);
const uncachedTokens = inputTokens.slice(numberOfMatchingTokens);

// The cached and uncached output text
const cachedText = tokenizer.decode(cachedTokens);
const uncachedText = tokenizer.decode(uncachedTokens);
```

## How Caching Works

If we run this, we can see that "The quick brown fox jumps over the lazy dog" has been cached. In other words, these would be counted as cached input tokens. And then, "What a brilliant story," gets counted as normal input tokens:

- Cached: "The quick brown fox jumps over the lazy dog"
- Uncached: ". What a brilliant story."

The way this cache works is you invalidate it as soon as you reach a token that isn't already in the cache. So if we change "quick" to "fast", for instance, and then run this again, we can see that it only caches one token:

- Cached: "The"
- Uncached: " fast brown fox jumps over the lazy dog. What a brilliant story."

Or of course, if we change this completely and just send "foo", for instance, and run it again, then we're going to end up with no caching:

- Cached: ""
- Uncached: "foo"

## Caching in Conversations

This caching behavior matches how conversations in most chat apps end up working. For instance, let's imagine that we have this in the cache where we have a user message and then an assistant message.

```ts
const tokensInCache = tokenize(
  // NOTE: Change this to change what's in the cache
  [
    'User: What is the capital of France?',
    'Assistant: Paris',
  ].join('\n'),
);

const inputTokens = tokenize(
  // NOTE: Change this to change what the input is
  [
    'User: What is the capital of France?',
    'Assistant: Paris',
    'User: What is the capital of Germany?',
  ].join('\n'),
);
```

Well, if we send some input tokens here where we just add in the previous conversation but add in a new question, we can see that all of the previous parts of the conversation have been cached and only the new stuff gets really charged to us at the uncached rate:

- Cached:
  - "User: What is the capital of France?"
  - "Assistant: Paris"
- Uncached:
  - "User: What is the capital of Germany?"

Cached input tokens and normal input tokens get billed at different rates. You should check out your model provider to see how caching works there.

Some model providers explicitly ask you to tell them how long to cache it for, and some use implicit caching where it's just automatically enabled. But all of them work like this where you have something in the cache and it gets cached up until the point where it receives a new token.

## Steps to Complete

- [ ] [Run the playground](./main.ts) with the initial settings to observe the basic caching behavior
  - Look for the green (cached) and red (uncached) text in the output

- [ ] Modify the `tokensInCache` variable to experiment with different cache contents
  - Try simple sentences, conversation formats, or completely different text

- [ ] Change the `inputTokens` variable to test different scenarios
  - Try matching the cache exactly
  - Try partial matches with the cache
  - Try completely different text from what's in the cache

- [ ] Test the [conversation scenario](../explainer.2/main.ts) by setting up both variables as conversation formats
  - See how adding new messages affects caching

- [ ] Experiment with changing just a single word or character in the input to see how it affects caching
  - Observe how early changes invalidate more of the cache than later changes
