Now we understand a bit more about how the AI SDK works, let's dive a bit deeper into LLM fundamentals

We need to understand a little bit about how LLMs work, because the constraints of how they work really, really impact how you build systems around them.

The first concept we're going to get our heads around is tokens. For this we're going to be using tiktokenizer, specifically their [online playground](https://tiktokenizer.vercel.app).

Watch the video to see a demo of this in action.

## Implementing Token Counting

Inside `main.ts` we've installed `js-tiktoken` which is a JavaScript implementation of the online playground:

```ts
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tokenizer = new Tiktoken(
  // NOTE: o200k_base is the tokenizer for GPT-4o
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const input = readFileSync(
  path.join(import.meta.dirname, 'input.md'),
  'utf-8',
);

const output = tokenize(input);

console.log('Content length in characters:', input.length);
console.log(`Number of tokens:`, output.length);
console.dir(output, { depth: null, maxArrayLength: 20 });
```

We're going to take in some input text that's in [`input.md`](./input.md). Then we're going to call `tokenize` on it which is going to encode the text into tokens and return an array of numbers.

We should then be able to see some logs where we log out the tokens with the number of tokens and the content length in characters.

When we run this we can see that the entire length of the text is nearly 2300 characters but the number of tokens is only 484.

Now the way tokens work is you're often billed by the token and so tokens, not words or characters are really the currency of LLMs.

## Steps To Complete

- [ ] Open the [`main.ts`](./main.ts) file and review the existing implementation of the [`tokenize`](./main.ts) function.

- [ ] Try changing the input text in [`input.md`](./input.md) and see how many tokens it spits out.
