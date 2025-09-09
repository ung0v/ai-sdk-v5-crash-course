In this lesson, we'll explore how different data formats affect token efficiency when working with LLMs. Understanding token usage is crucial for optimizing your prompts and context windows.

## Comparing Different Data Formats

I want to demonstrate how you can pass different types of data to your LLMs and compare their token efficiency. Let's examine our starting point:

```ts
const DATA = [
  {
    url: 'https://aihero.dev',
    title: 'AI Hero',
  },
  {
    url: 'https://totaltypescript.com',
    title: 'Total TypeScript',
  },
  {
    url: 'https://mattpocock.com',
    title: 'Matt Pocock',
  },
  {
    url: 'https://twitter.com/mattpocockuk',
    title: 'Twitter',
  },
];
```

We have an array of URLs, each with a URL and a title. We might be passing these to an LLM for citations or similar purposes.

We're creating three different representations of the same data:

1. XML format
2. JSON format
3. Markdown list format

```ts
const asXML = DATA.map(
  (item) =>
    `<item url="${item.url}" title="${item.title}"></item>`,
).join('\n');
```

```ts
const asJSON = JSON.stringify(DATA, null, 2);
```

```ts
const asMarkdown = DATA.map(
  (item) => `- [${item.title}](${item.url})`,
).join('\n');
```

## Token Comparison Results

When we run this code, we log the token count for each format:

```ts
console.log('Markdown tokens:', tokenize(asMarkdown).length);
console.log(asMarkdown);
console.log('--------------------------------');
console.log('XML tokens:', tokenize(asXML).length);
console.log(asXML);
console.log('--------------------------------');
console.log('JSON tokens:', tokenize(asJSON).length);
console.log(asJSON);
```

The results show some interesting differences:

| Format   | Token Count |
| -------- | ----------- |
| Markdown | 53 tokens   |
| XML      | 77 tokens   |
| JSON     | 103 tokens  |

## Understanding Format Efficiency

It's important not to draw overly general conclusions from this specific example. It's not always true that:

- JSON is always larger
- XML is always medium-sized
- Markdown is always the most efficient

However, thinking about these representations in terms of token count is extremely valuable for optimization.

A significant aspect of context engineering (which we'll cover later) involves getting retrieved data into your LLM efficiently.

Generally speaking, the fewer tokens you spend on getting that data into your context window, the better you're doing.

## Exercise Suggestions

I recommend experimenting with these representations:

1. Try adding markdown titles instead of just a normal list
2. Make the XML more verbose to see how that affects token count
3. Modify the JSON formatting (removing `null` and `2` to have it on a single line)

The goal is to understand how data representation affects token counts and how different formats can be more or less token-efficient.

Good luck, and I'll see you in the next one.

## Steps To Complete

- [ ] Run the existing code to observe the token counts for each format
  - Use `pnpm run dev` to execute the code
  - Note the token counts for markdown (53), XML (77), and JSON (103)

- [ ] Modify the markdown representation to include titles
  - Try changing the format to include headers or other markdown elements
  - Run the code again to see how this affects token count

- [ ] Make the XML representation more verbose
  - Add additional attributes or nested elements
  - Compare the new token count with the original

- [ ] Experiment with the JSON formatting
  - Remove the formatting parameters (`null, 2`) to have JSON on a single line
  - Run the code again to see if this reduces token count
