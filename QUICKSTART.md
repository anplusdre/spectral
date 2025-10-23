# Quick Start Guide

Get up and running with the AI Automation Browser in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure API Keys

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# LLM API (OpenAI, Anthropic, etc.)
LLM_API_KEY=sk-your-key-here
LLM_API_ENDPOINT=https://api.openai.com/v1
LLM_MODEL=gpt-4

# DeepSeek OCR API
DEEPSEEK_OCR_API_KEY=your-deepseek-key-here
DEEPSEEK_OCR_API_ENDPOINT=https://api.deepseek.com/v1/ocr

# API Server Settings
API_PORT=3000
DATABASE_PATH=./data/browser.db
```

**Note:** The browser will work without API keys, but LLM and OCR features will not be available.

## Step 3: Build the Application

```bash
npm run build
```

## Step 4: Start the Browser

```bash
npm start
```

The application will:
- Open the browser window
- Start the API server on port 3000
- Initialize the task database

## Step 5: Create Your First Task

### Option A: Using the UI

1. Click the "+ New" button in the sidebar
2. Fill in the task details:
   - **Name**: "My First Task"
   - **Description**: "Navigate to a website"
   - **Steps**: Copy and paste this JSON:

```json
[
  {
    "id": "1",
    "action": "navigate",
    "value": "https://example.com"
  },
  {
    "id": "2",
    "action": "wait",
    "waitTime": 2000
  },
  {
    "id": "3",
    "action": "extract",
    "selector": "h1",
    "outputVariable": "pageTitle"
  }
]
```

3. Click "Create Task"

### Option B: Using the API

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Task",
    "description": "Navigate to a website",
    "steps": [
      {
        "id": "1",
        "action": "navigate",
        "value": "https://example.com"
      },
      {
        "id": "2",
        "action": "wait",
        "waitTime": 2000
      },
      {
        "id": "3",
        "action": "extract",
        "selector": "h1",
        "outputVariable": "pageTitle"
      }
    ]
  }'
```

## Step 6: Browse the Web

- Enter a URL in the address bar and click "Go"
- Use the navigation buttons (back, forward, refresh)
- Create new tabs with the "+" button
- Switch between tabs

## Next Steps

### Try Advanced Features

#### LLM-Powered Analysis

```bash
curl -X POST http://localhost:3000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain browser automation in 3 sentences"
  }'
```

#### OCR Text Extraction

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image-with-text.jpg",
    "language": "en"
  }'
```

### Explore Example Tasks

Check out `examples/sample-tasks.json` for more complex automation examples:
- Google search automation
- Form filling
- Web scraping
- Screenshot and OCR workflows

### Learn the API

Read `examples/api-usage.md` for comprehensive API documentation and examples in multiple languages.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```env
API_PORT=3001
```

### Module Not Found Errors

Ensure all dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

### API Authentication Errors

- Verify your API keys are correct in `.env`
- Check that you have API credits/quota available
- Test the API endpoints directly with curl

### Browser Window Not Opening

Try running in development mode:

```bash
npm run dev
```

## Development Mode

For active development with hot-reload:

```bash
npm run dev
```

This will:
- Watch for changes in main process code
- Run webpack dev server for renderer
- Auto-restart the API server on changes

## Common Commands

```bash
# Start the application
npm start

# Development mode with hot-reload
npm run dev

# Build for production
npm run build

# Package as distributable
npm run package

# Run linter
npm run lint

# Format code
npm run format
```

## Getting Help

- **Documentation**: Read the full README.md
- **Examples**: Check the examples/ directory
- **API Reference**: See examples/api-usage.md
- **Issues**: Open an issue on GitHub

## What's Next?

1. **Create Complex Tasks**: Combine multiple actions for sophisticated workflows
2. **Use LLM Features**: Let AI analyze web pages and extract data intelligently
3. **Implement OCR**: Extract text from images and PDFs
4. **Build Integrations**: Use the REST API to integrate with your existing tools
5. **Automate Repetitive Tasks**: Save time by automating manual browser work

Happy Automating! 🚀
