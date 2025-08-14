# AI SDK v5 Tutorial

🚀 **The AI SDK v5 is here, and it's incredible.** This repository contains all the code examples and exercises from our free, comprehensive AI SDK v5 tutorial available on [aihero.dev](https://aihero.dev).

AI SDK v5 brings revolutionary improvements to building AI applications with TypeScript. I think of it as the missing standard library for building AI apps.

## 🎯 What You'll Learn

By following along with the tutorial and working through these exercises, you'll master:

- **AI SDK v5 Fundamentals** - Understanding what the AI SDK is and how it works
- **Text Streaming** - Building real-time streaming experiences to the UI
- **Tool Calling** - Creating AI applications that can use external tools and APIs
- **Message Parts** - Working with structured message components and data
- **Model Context Protocol (MCP)** - Integrating with external data sources and tools
- **File & Image Handling** - Processing and working with multimedia content
- **Custom Data Parts** - Building rich, interactive AI experiences with custom data
- **Message Metadata** - Adding context and tracking to your AI conversations

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (version 22 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn/bun
- API keys for your preferred AI providers:
  - [OpenAI](https://platform.openai.com/api-keys) (GPT-4, GPT-3.5)
  - [Anthropic](https://console.anthropic.com/) (Claude)
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

### Setup

1. **Clone this repository:**

```bash
git clone https://github.com/ai-hero-dev/ai-sdk-5-tutorial.git
cd ai-sdk-5-tutorial
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Configure your environment:**

```bash
cp .env.example .env
```

4. **Add your API keys to `.env`** and you're ready to go!

## 📚 Running the Exercises

Start by running `pnpm dev`:

```bash
pnpm dev
```

This will allow you to choose between the different exercises.

You can also run `pnpm exercise <exercise-number>` to run a specific exercise.

## 📁 Repository Structure

```
exercises/
├── 01-basics/                    # AI SDK v5 fundamentals
│   ├── 01.1-what-is-the-ai-sdk/
│   ├── 01.2-choosing-a-model/
│   ├── 01.3-stream-text-to-terminal/
│   ├── 01.4-ui-message-streams/
│   ├── 01.5-stream-text-to-ui/
│   └── 01.6-system-prompts/
├── 02-agents/              # Tool calling & agents
├── 03-advanced/                  # Advanced features
└── 99-reference/                 # Reference implementations
```

## 🛠️ Exercise Workflow

Each exercise follows this structure:

### `problem/` folder

- **Your coding playground** - Start here!
- Contains `readme.md` with detailed instructions
- Code files with `TODO` comments for you to implement
- This is where the learning happens

### `solution/` folder

- **Reference implementation** - Check when you're stuck
- Complete, working code for each exercise
- Great for comparing approaches and learning best practices

### `explainer/` folder

- **Deep dives** - Additional explanations and concepts
- Extended walkthroughs of complex topics
- Perfect for reinforcing your understanding

## 🎥 Watch the Full Tutorial

This repository is the companion to our comprehensive AI SDK v5 tutorial on [aihero.dev](https://aihero.dev). The tutorial includes:

- **Step-by-step video walkthroughs** of every exercise
- **Deep dives** into AI SDK v5 concepts and patterns
- **Best practices** for production AI applications
- **Real-world examples** and use cases

## 🆕 What's New in AI SDK v5?

AI SDK v5 introduces groundbreaking features that make building AI applications easier and more powerful than ever:

- **Enhanced Streaming** - Better real-time experiences
- **Improved Multi-Provider Support** - Seamless switching between AI providers
- **Advanced Memory Patterns** - More sophisticated state management
- **Better Type Safety** - Enhanced TypeScript integration
- **Simplified Agent Creation** - Easier multi-agent workflows
- **Production-Ready Tools** - Built-in testing and monitoring capabilities

## 🤝 Need Help?

1. **Check the solution** - Each exercise has a completed version
2. **Verify your setup** - Ensure API keys and dependencies are correct
3. **Watch the tutorial** - Full explanations available on aihero.dev

Ready to build the future of AI applications? Let's dive into AI SDK v5! 🚀
