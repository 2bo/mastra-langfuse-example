# Mastra Langfuse Example

Example project demonstrating integration of [Mastra](https://mastra.ai) with [Langfuse](https://langfuse.com) observability.

## Features

- **AI Agents**: Weather agent with Japanese language support
- **Workflows**: Weather information workflow with city translation
- **Observability**: Langfuse integration for tracing and monitoring
- **Scorers**: Custom scorers for tool call appropriateness, completeness, and translation quality
- **Memory**: Persistent memory using LibSQL
- **Experiments**: Dataset creation and experiment evaluation

## Prerequisites

- Node.js >= 22.13.0
- Langfuse account (for observability)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/2bo/mastra-langfuse-example.git
cd mastra-langfuse-example
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

## Usage

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build the project:
```bash
npm run build
```

### Production

Start the production server:
```bash
npm start
```

## Code Quality

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatting
```bash
npm run format
npm run format:check
```

## Experiments

### Create Dataset
```bash
npm run experiment:create-dataset
```

### Run Experiment
```bash
npm run experiment:run
```

## Project Structure

```
src/
├── mastra/
│   ├── agents/           # AI agents
│   │   ├── weather-agent.ts
│   │   └── city-translator-agent.ts
│   ├── tools/            # Agent tools
│   │   └── weather-tool.ts
│   ├── workflows/        # Workflows
│   │   └── weather-workflow.ts
│   ├── scorers/          # Custom scorers
│   │   └── weather-scorer.ts
│   ├── experiments/      # Evaluation experiments
│   │   ├── datasets/
│   │   ├── evaluators/
│   │   ├── scripts/
│   │   └── tasks/
│   └── index.ts          # Mastra configuration
```

## Technologies

- [Mastra](https://mastra.ai) - AI agent framework
- [Langfuse](https://langfuse.com) - LLM observability platform
- [LibSQL](https://github.com/tursodatabase/libsql) - Embedded database
- [OpenTelemetry](https://opentelemetry.io/) - Observability framework
