# AI Automation Browser

A powerful Chromium-based browser with built-in LLM and DeepSeek-OCR integration, featuring advanced automation tools and task management capabilities.

## Features

### 🤖 AI Integration
- **LLM API Bridge**: Integrate with OpenAI, Anthropic, or any compatible LLM API
  - Text analysis and content generation
  - Intelligent data extraction from web pages
  - Automated task generation from natural language descriptions
- **DeepSeek-OCR Bridge**: Extract text from images and screenshots
  - High-accuracy text recognition
  - Structured data extraction from images
  - Multi-language support

### 🔧 Browser Automation
- **Visual Automation Engine**: Full browser automation capabilities
  - Navigate, click, type, scroll, and interact with web pages
  - Wait for elements and conditions
  - Extract data from pages
  - Take screenshots
  - Execute custom JavaScript
- **AI-Powered Actions**:
  - LLM-based page analysis
  - OCR text extraction from screenshots
  - Intelligent form filling

### 📋 Task Management
- **Create and Manage Tasks**: Build complex automation workflows
- **Task Persistence**: SQLite database for storing tasks and results
- **Execution History**: Track task runs, outputs, and errors
- **Status Tracking**: Monitor task execution in real-time

### 🌐 REST API
Full-featured API for external control and integration:
- Task CRUD operations
- Task execution and monitoring
- LLM interactions
- OCR processing
- Task result retrieval

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chromium-ai-automation-browser
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
LLM_API_KEY=your_llm_api_key_here
LLM_API_ENDPOINT=https://api.openai.com/v1
LLM_MODEL=gpt-4

DEEPSEEK_OCR_API_KEY=your_deepseek_ocr_api_key_here
DEEPSEEK_OCR_API_ENDPOINT=https://api.deepseek.com/v1/ocr

API_PORT=3000
DATABASE_PATH=./data/browser.db
```

4. Build the application:
```bash
npm run build
```

5. Start the application:
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## Usage

### Browser Interface

The application provides a modern browser interface with:
- **Navigation Bar**: Navigate to URLs, go back/forward, refresh
- **Tab Management**: Create and switch between multiple tabs
- **Task Sidebar**: View, create, and manage automation tasks
- **Status Bar**: Monitor application status and API server

### Creating Automation Tasks

Tasks are defined using JSON with a series of steps:

```json
{
  "name": "Example Task",
  "description": "Navigate to a page and extract data",
  "steps": [
    {
      "id": "1",
      "action": "navigate",
      "value": "https://example.com"
    },
    {
      "id": "2",
      "action": "wait",
      "selector": ".content",
      "waitTime": 2000
    },
    {
      "id": "3",
      "action": "extract",
      "selector": "h1",
      "outputVariable": "title"
    },
    {
      "id": "4",
      "action": "screenshot",
      "outputVariable": "screenshot"
    }
  ]
}
```

### Available Actions

| Action | Description | Required Fields |
|--------|-------------|----------------|
| `navigate` | Navigate to URL | `value` (URL) |
| `click` | Click element | `selector` |
| `type` | Type text into element | `selector`, `value` |
| `wait` | Wait for element or time | `selector` or `waitTime` |
| `extract` | Extract text from element | `selector`, `outputVariable` |
| `screenshot` | Take screenshot | `outputVariable` |
| `scroll` | Scroll page or to element | `selector` or `value` |
| `select` | Select dropdown option | `selector`, `value` |
| `executeScript` | Execute JavaScript | `value` (script) |
| `llmAnalyze` | Analyze page with LLM | `value` (instruction) |
| `ocrExtract` | Extract text via OCR | `outputVariable` |

## REST API Documentation

### Task Management

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "name": "Task Name",
  "description": "Task description",
  "steps": [...]
}
```

#### Get All Tasks
```http
GET /api/tasks
```

#### Get Task by ID
```http
GET /api/tasks/:id
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Get Task Results
```http
GET /api/tasks/:id/results?limit=10
```

### LLM API

#### Chat
```http
POST /api/llm/chat
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "systemPrompt": "Optional system prompt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

#### Analyze Text
```http
POST /api/llm/analyze
Content-Type: application/json

{
  "text": "Text to analyze",
  "instruction": "Analyze this text for sentiment"
}
```

#### Extract Data
```http
POST /api/llm/extract
Content-Type: application/json

{
  "html": "<html>...</html>",
  "schema": {
    "title": "Page title",
    "price": "Product price",
    "description": "Product description"
  }
}
```

#### Generate Automation Steps
```http
POST /api/llm/generate-steps
Content-Type: application/json

{
  "description": "Go to Google, search for 'AI automation', and click the first result"
}
```

### OCR API

#### Extract Text
```http
POST /api/ocr/extract
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "language": "en"
}
```

Or with base64:
```json
{
  "imageBase64": "data:image/png;base64,...",
  "language": "en"
}
```

#### Extract Structured Data
```http
POST /api/ocr/structured
Content-Type: application/json

{
  "imageBase64": "data:image/png;base64,...",
  "fields": ["name", "email", "phone"]
}
```

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Browser   │      │ IPC Handlers │  │
│  │   Window   │◄─────┤              │  │
│  └────────────┘      └──────────────┘  │
└─────────────────────────────────────────┘
           │                    │
           ▼                    ▼
┌─────────────────┐    ┌──────────────────┐
│    Renderer     │    │   API Server     │
│   (Browser UI)  │    │   (Express)      │
│                 │    │                  │
│  - Navigation   │    │  - REST API      │
│  - Tab Mgmt     │    │  - Task Manager  │
│  - Task List    │    │  - LLM Bridge    │
└─────────────────┘    │  - OCR Bridge    │
                       │  - Auto Engine   │
                       └──────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                       ▼                 ▼
                 ┌──────────┐     ┌──────────┐
                 │   LLM    │     │   OCR    │
                 │   API    │     │   API    │
                 └──────────┘     └──────────┘
```

### Technologies

- **Electron**: Chromium-based desktop application framework
- **TypeScript**: Type-safe development
- **Express**: REST API server
- **SQLite**: Task and result persistence
- **Axios**: HTTP client for API calls
- **Puppeteer-core**: Browser automation (if needed)

## Development

### Project Structure

```
chromium-ai-automation-browser/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.ts
│   ├── renderer/          # Browser UI
│   │   ├── index.html
│   │   └── app.js
│   ├── api/              # REST API server
│   │   ├── server.ts
│   │   └── routes.ts
│   ├── bridges/          # API integrations
│   │   ├── llm-bridge.ts
│   │   └── ocr-bridge.ts
│   ├── automation/       # Automation engine
│   │   └── automation-engine.ts
│   ├── tasks/           # Task management
│   │   └── task-manager.ts
│   └── types/           # TypeScript types
│       └── index.ts
├── dist/                # Compiled output
├── data/                # Database files
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm start` - Start the application
- `npm run dev` - Development mode with hot-reload
- `npm run build` - Build for production
- `npm run package` - Package as distributable
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Examples

### Example 1: Web Scraping Task

```json
{
  "name": "Scrape Product Data",
  "description": "Extract product information from e-commerce site",
  "steps": [
    {
      "id": "1",
      "action": "navigate",
      "value": "https://example-shop.com/products"
    },
    {
      "id": "2",
      "action": "wait",
      "selector": ".product-list",
      "waitTime": 3000
    },
    {
      "id": "3",
      "action": "llmAnalyze",
      "value": "Extract all product names, prices, and ratings as JSON",
      "outputVariable": "products"
    }
  ]
}
```

### Example 2: Form Automation

```json
{
  "name": "Fill Contact Form",
  "description": "Automatically fill and submit contact form",
  "steps": [
    {
      "id": "1",
      "action": "navigate",
      "value": "https://example.com/contact"
    },
    {
      "id": "2",
      "action": "type",
      "selector": "#name",
      "value": "John Doe"
    },
    {
      "id": "3",
      "action": "type",
      "selector": "#email",
      "value": "john@example.com"
    },
    {
      "id": "4",
      "action": "type",
      "selector": "#message",
      "value": "Hello, this is an automated message"
    },
    {
      "id": "5",
      "action": "click",
      "selector": "button[type='submit']"
    },
    {
      "id": "6",
      "action": "wait",
      "waitTime": 2000
    },
    {
      "id": "7",
      "action": "screenshot",
      "outputVariable": "confirmation"
    }
  ]
}
```

### Example 3: OCR Processing

```json
{
  "name": "Extract Text from Invoice",
  "description": "Use OCR to extract data from invoice screenshot",
  "steps": [
    {
      "id": "1",
      "action": "navigate",
      "value": "https://example.com/invoice-viewer"
    },
    {
      "id": "2",
      "action": "wait",
      "selector": ".invoice-image",
      "waitTime": 2000
    },
    {
      "id": "3",
      "action": "screenshot",
      "outputVariable": "invoiceImage"
    },
    {
      "id": "4",
      "action": "ocrExtract",
      "outputVariable": "invoiceText"
    }
  ]
}
```

## Troubleshooting

### API Connection Issues

If you see "API authentication failed":
- Check your API keys in `.env`
- Verify the API endpoints are correct
- Ensure you have sufficient API credits

### Database Errors

If tasks aren't saving:
- Check that the `data/` directory exists
- Verify write permissions
- Check database path in `.env`

### Browser Automation Issues

If automation steps fail:
- Increase wait times for slow-loading pages
- Verify selectors are correct
- Use the browser DevTools to inspect elements
- Check console logs for detailed error messages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the documentation thoroughly

## Roadmap

- [ ] Puppeteer integration for headless automation
- [ ] Task scheduling and cron support
- [ ] Visual task builder (drag-and-drop)
- [ ] Browser extension support
- [ ] Multiple profile management
- [ ] Cloud sync for tasks
- [ ] Advanced debugging tools
- [ ] Plugin system for custom actions
- [ ] Performance monitoring
- [ ] Export/import task libraries
