The pattern we saw established in [guardrails](/exercises/09-advanced-patterns/09.01-guardrails/problem/readme.md), where we add an extra LLM call before the main LLM call, can be used for many interesting applications.

One powerful implementation is a model router.

A model router allows us to choose which model we want to use based on the user's question. We can route requests through different LLMs depending on the complexity of the query.

Different LLMs have pricing at different orders of magnitude. If we can route simple requests to a simpler (and usually cheaper) LLM while still getting good responses, we should definitely do that.

## Setup Structure

Our setup is very similar to the previous exercise:

- We're inside a `createUIMessageStream`
- Between two `console.time` calls, we'll use `generateText` to call a model
- We pass in model messages and write our own system prompt

```ts
console.time('Model Calculation Time');
// TODO: Use generateText to call a model, passing in the modelMessages
// and writing your own system prompt.
const modelRouterResult = TODO;

console.timeEnd('Model Calculation Time');
```

## Writing The Prompt

Since this routing needs to run as quickly as possible, we'll use the same technique we used in guardrails:

- Return 0 for the basic model
- Return 1 for the advanced model

I recommend you use the prompt template we covered in an earlier [section](/exercises/05-context-engineering/05.01-the-template/explainer/readme.md).

The output format section will be especially important - as will the rules, which will dictate which model to use under which circumstances.

## Handling the Model Selection

Next, we'll need to fill in the `modelSelected` variable by determining which model to use from the model router result:

```ts
// TODO: Use the modelRouterResult to determine which model to use.
// If we can't determine which model to use, use the basic model.
const modelSelected: 'advanced' | 'basic' = TODO;
```

## Displaying the Model in the Frontend

We also want to display which model was used in the frontend. To do this, we'll use message metadata.

```ts
writer.merge(
  streamTextResult.toUIMessageStream({
    // TODO: Add the model to the message metadata, so that
    // the frontend can display it.
    messageMetadata: TODO,
  }),
);
```

We've already set up the `MyMessage` type to include a `model` property:

```ts
export type MyMessage = UIMessage<{
  model: 'advanced' | 'basic';
}>;
```

And our `Message` component already has a metadata prop:

```tsx
<Message
  role={message.role}
  parts={message.parts}
  metadata={message.metadata}
/>
```

Inside the Message component, we can check for the `model` property and display it if it exists:

```tsx
{
  metadata?.model && (
    <div className="text-sm text-gray-500 mt-1">
      Model: {metadata.model}
    </div>
  );
}
```

So all you need to do is handle passing the model to the message metadata inside `createUIMessageStream`. The previous exercise on [message metadata](/exercises/07-streaming/07.03-message-metadata/problem/readme.md) will be helpful.

## Testing

Once your implementation is complete, you should be able to:

1. Ask a question to your system
2. The system will choose the best model for that answer
3. It will reply using that model
4. It will pass in message metadata to tell you which model it used

Try prompting your system with various different inputs to see how it chooses between the different models, and adjust your system prompt accordingly.

## Steps To Complete

- [ ] Implement the model router using `generateText`
  - Write a system prompt that determines whether to use the basic or advanced model
  - Return 0 for basic model, 1 for advanced model

- [ ] Parse the model router result to determine which model to use
  - Get the model selection from `modelRouterResult.text.trim()`
  - Add a fallback to the basic model if the selection is unclear

- [ ] Add the model type to the message metadata
  - Pass the selected model ('basic' or 'advanced') to the message metadata

- [ ] Test your implementation
  - Ask simple questions that should use the basic model
  - Ask complex questions that should use the advanced model
  - Verify the model selection appears in the UI
  - Adjust your system prompt based on results
