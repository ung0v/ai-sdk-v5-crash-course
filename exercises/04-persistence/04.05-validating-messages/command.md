Copy and paste the below into your terminal to test the API!

## Invalid message

```bash
curl -X POST http://localhost:3000/api/chat   -H "Content-Type: application/json"   -d '{
  "messages": [
    {
      "id": "invalid-message",
      "role": "user"
    }
  ]
}'
```

## Valid message

```bash
curl -X POST http://localhost:3000/api/chat   -H "Content-Type: application/json"   -d '{
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
