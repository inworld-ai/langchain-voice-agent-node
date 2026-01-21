# LangChain Voice Agent

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Powered by Inworld AI TTS](https://img.shields.io/badge/Powered_by-Inworld_AI-orange)](https://inworld.ai/tts)
[![LangChain](https://img.shields.io/badge/LangChain-Agents-blue)](https://langchain.com/)

A real-time voice-to-voice AI agent built with LangChain, AssemblyAI for speech-to-text, and Inworld for text-to-speech. As we're illustrating the "voice agent sandwich" of STT -> LLM -> TTS, our example scenario is also one where you can order a sandwich.

## Prerequisites

- Node.js v20 or higher
- npm v9 or higher

### API Keys

| Service | Environment Variable | Purpose | Get Key |
|---------|---------------------|---------|---------|
| Anthropic | `ANTHROPIC_API_KEY` | Claude LLM | [console.anthropic.com](https://console.anthropic.com/) |
| AssemblyAI | `ASSEMBLYAI_API_KEY` | Speech-to-Text | [assemblyai.com](https://www.assemblyai.com/) |
| Inworld | `INWORLD_API_KEY` | Text-to-Speech | [platform.inworld.ai](https://platform.inworld.ai/) |

## Get Started

### Step 1: Clone and Install

```bash
git clone https://github.com/inworld-ai/langchain-voice-agent-node
cd langchain-voice-agent-node
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Step 3: Build and Run

```bash
npm run build
npm start
```

Click the link in the terminal (`http://localhost:8000`) to open the app. Click "Start Conversation" to begin speaking with the agent.

## Development

For development with hot reload:

```bash
npm run dev
```

## Project Structure

```
langchain-voice-agent-node/
├── src/
│   ├── backend/              # Node.js + Hono server
│   │   ├── index.ts          # Server & WebSocket pipeline
│   │   ├── types.ts          # Event type definitions
│   │   ├── utils.ts          # Async iterator utilities
│   │   ├── assemblyai/       # AssemblyAI STT client
│   │   │   ├── index.ts
│   │   │   ├── api-types.ts
│   │   │   └── stt.ts
│   │   └── inworld/          # Inworld TTS client
│   │       ├── index.ts
│   │       ├── api-types.ts
│   │       ├── prompts.ts
│   │       └── tts.ts
│   └── frontend/             # Svelte web app
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
├── package.json
├── tsconfig.json
└── .env.example
```

## npm Scripts

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies (root + frontend workspace) |
| `npm run build` | Build frontend, then compile backend |
| `npm start` | Run server on :8000 |
| `npm run dev` | Build frontend + run backend with hot-reload |
| `npm run lint` | Run ESLint on backend code |
| `npm run type-check` | TypeScript type checking |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
