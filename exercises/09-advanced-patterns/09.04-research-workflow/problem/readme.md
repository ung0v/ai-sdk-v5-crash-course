In this exercise, we're going to build a research workflow. We should be able to ask questions of our system, and it will search the web and provide a response for us - after synthesizing a ton of information.

This will be much more freeform than previous exercises, giving you more license to solve the problem in your own way.

You'll need a [Tavily API key](https://tavily.com/) to make the search functionality work - it's free to sign up for.

## The Setup

Our system follows a four-step process:

1. Generate search queries for [Tavily](https://tavily.com/) (similar to Google searches)
2. Stream those queries and a research plan to the frontend
3. Call Tavily to get search results
4. Stream a final summary to the user

Let's look at the code structure to understand what needs to be implemented.

The main functionality is defined in the `chat.ts` file, which contains several functions that need to be implemented:

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const queriesResult =
      await generateQueriesForTavily(modelMessages);

    await displayQueriesInFrontend(queriesResult, writer);

    const scrapedPages = await callTavilyToGetSearchResults(
      (await queriesResult.object).queries,
    );

    await streamFinalSummary(
      scrapedPages,
      modelMessages,
      writer,
    );
  },
});
```

## `generateQueriesForTavily`

The first function needs to use `streamObject` to generate a plan and queries based on the conversation history:

```ts
const generateQueriesForTavily = (
  modelMessages: ModelMessage[],
) => {
  // TODO: Use streamObject to generate a plan for the search,
  // AND the queries to search the web for information.
  // The plan should identify the groups of information required
  // to answer the question.
  // The plan should list pieces of information that are required
  // to answer the question, then consider how to break down the
  // information into queries.
  // Generate 3-5 queries that are relevant to the conversation history.
  // Reply as a JSON object with the following properties:
  // - plan: A string describing the plan for the queries.
  // - queries: An array of strings, each representing a query.
  const queriesResult = TODO;

  return queriesResult;
```

You'll need to replace the `TODO` with code that uses `streamObject` to generate an object with `plan` and `queries` properties.

## `displayQueriesInFrontend`

Next, you need to implement the function to stream the queries and plan to the frontend:

```ts
const displayQueriesInFrontend = async (
  queriesResult: ReturnType<typeof generateQueriesForTavily>,
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  const queriesPartId = crypto.randomUUID();
  const planPartId = crypto.randomUUID();

  for await (const part of queriesResult.partialObjectStream) {
    // TODO: Stream the queries and plan to the frontend
    TODO;
  }
};
```

You'll need to use the `writer` to stream the partial objects as they become available.

## `callTavilyToGetSearchResults`

One function I've already implemented for you is `callTavilyToGetSearchResults`, which calls the Tavily API to get search results:

```ts
const callTavilyToGetSearchResults = async (
  queries: string[],
) => {
  const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY,
  });

  const searchResults = await Promise.all(
    queries.map(async (query) => {
      const response = await tavilyClient.search(query, {
        maxResults: 5,
      });

      return {
        query,
        response,
      };
    }),
  );

  return searchResults;
};
```

Note how we're getting `5` results per query - this might be a number you want to mess around with.

## `streamFinalSummary`

Finally, you need to implement the summary generation:

```ts
const streamFinalSummary = async (
  searchResults: Awaited<
    ReturnType<typeof callTavilyToGetSearchResults>
  >,
  messages: ModelMessage[],
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  // TODO: Use streamText to generate a final response to the user.
  // The response should be a summary of the search results,
  // and the sources of the information.
  const answerResult = TODO;

  writer.merge(
    // NOTE: We send sendStart: false because we've already
    // sent the 'start' message part to the frontend.
    // Without this, we'd end up with two assistant messages
    // in the frontend.
    answerResult.toUIMessageStream({ sendStart: false }),
  );
};
```

This function should use `streamText` to generate a comprehensive summary based on the search results.

One way to improve your implementation is to include markdown links in the summary. This allows users to click through to the original sources, which enhances the user experience.

The summary should include references to the sources, formatted as clickable links that the user can follow to verify the information.

## Testing

Once you've implemented all the functions, you can test your solution with different queries. The example query provided is:

```tsx
const [input, setInput] = useState(
  `Which are better? Gas, electric, or induction hobs? Please provide a detailed answer.`,
);
```

## Steps To Complete

- [ ] Set up your Tavily API key (if you haven't already)
  - Sign up at [Tavily](https://tavily.com/)
  - Add your API key to the environment variables under `TAVILY_API_KEY`

- [ ] Implement `generateQueriesForTavily` function
  - Use `streamObject` to generate a plan and queries
  - The object should have `plan` (string) and `queries` (string array) properties

- [ ] Implement `displayQueriesInFrontend` function
  - Stream the plan and queries to the frontend
  - Use the `writer` to update parts with the appropriate IDs

- [ ] Implement `streamFinalSummary` function
  - Use `streamText` to generate a summary based on search results
  - Include markdown links to sources in the summary

- [ ] Test your implementation
  - Run the exercise with `pnpm run exercise`
  - Test with different queries to ensure it works correctly
  - Verify that the frontend displays the plan, queries, and summary correctly
