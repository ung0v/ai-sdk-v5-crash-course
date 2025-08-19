**Advanced Patterns**

Add guardrails exercise
Add branching UX exercise

- Use a linked list approach
- Simplify fetching by fetching everything in the frontend and reconstituting the linked list (saves further roundtrips)
- When the user edits a message, we:
  - Update the state in the frontend:
    - To show the arrows for the next and previous messages
    - Call `sendMessage`, passing in the existing message id
  - This will send to the backend:
    - `messageId`: The message id being overwritten
    - `parts`: The new content
    - `chatId`: The chat id
  - In the backend, we:
    - Use the `messageId` to find the _previous_ message to attach to
    - Create the new message, linking it to the message before it
    - Save it to the database
    - Generate the new message
    - On finish, link it to the message before it

Got pretty far with branching, now I just need to figure out the frontend state and how we represent the messages we have selected in the search params.

I think probably we can just use a single messageId in the search params. Then we can construct the linked list in both directions from that single message id. Buttons to go to the next and previous messages would simply update the search param.

---

**Observability**

Add more observability exercises

---

**Persistence**

Add 'storing chats in postgres' exercise

---

**Streaming**

Add 'persistence after stream aborted' exercise
Add 'proper error handling' exercise
Add 'optimizing markdown streaming' exercise

---

**Evals**

Add an 'evaluating chat title generation' exercise to evals section

---

Add 'resumable streaming' exercise

- Attempted to make it work, but various AI SDK stuff needs to be resolved first.
- SSE support doesn't work with my Hono setup
