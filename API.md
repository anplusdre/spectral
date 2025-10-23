# REST API Documentation

Complete API reference for the AI Automation Browser.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health

Check if the API server is running.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Task Management

### Create Task

#### POST /api/tasks

Create a new automation task.

**Request Body:**
```json
{
  "name": "Task Name",
  "description": "Optional description",
  "steps": [
    {
      "id": "1",
      "action": "navigate",
      "value": "https://example.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Task Name",
    "description": "Optional description",
    "steps": [...],
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Tasks

#### GET /api/tasks

Retrieve all tasks.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `running`, `completed`, `failed`, `paused`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Task Name",
      "status": "completed",
      ...
    }
  ]
}
```

### Get Task by ID

#### GET /api/tasks/:id

Retrieve a specific task.

**Parameters:**
- `id`: Task UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Task Name",
    ...
  }
}
```

### Update Task

#### PUT /api/tasks/:id

Update an existing task.

**Parameters:**
- `id`: Task UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "steps": [...],
  "status": "pending"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    ...
  }
}
```

### Delete Task

#### DELETE /api/tasks/:id

Delete a task.

**Parameters:**
- `id`: Task UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### Get Task Results

#### GET /api/tasks/:id/results

Get execution results for a task.

**Parameters:**
- `id`: Task UUID

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "taskId": "uuid",
      "status": "completed",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T00:01:00.000Z",
      "outputs": {
        "variableName": "value"
      },
      "errors": [],
      "logs": ["Log message 1", "Log message 2"]
    }
  ]
}
```

---

## LLM API

### Chat

#### POST /api/llm/chat

Send a chat request to the LLM.

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "systemPrompt": "Optional system prompt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "LLM response",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 50,
      "totalTokens": 60
    },
    "model": "gpt-4"
  }
}
```

### Analyze Text

#### POST /api/llm/analyze

Analyze text with a specific instruction.

**Request Body:**
```json
{
  "text": "Text to analyze",
  "instruction": "What to analyze for"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Analysis result from LLM"
  }
}
```

### Extract Data

#### POST /api/llm/extract

Extract structured data from HTML using LLM.

**Request Body:**
```json
{
  "html": "<html>...</html>",
  "schema": {
    "fieldName": "Field description",
    "price": "Product price",
    "title": "Product title"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fieldName": "Extracted value",
    "price": "$99.99",
    "title": "Product Name"
  }
}
```

### Generate Automation Steps

#### POST /api/llm/generate-steps

Generate automation steps from natural language description.

**Request Body:**
```json
{
  "description": "Go to Google, search for 'automation', and click first result"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "action": "navigate",
        "value": "https://google.com"
      },
      {
        "action": "type",
        "selector": "input[name='q']",
        "value": "automation"
      },
      ...
    ]
  }
}
```

---

## OCR API

### Extract Text

#### POST /api/ocr/extract

Extract text from an image.

**Request Body (with URL):**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "language": "en"
}
```

**Request Body (with Base64):**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text from image",
    "confidence": 0.95,
    "blocks": [
      {
        "text": "Block text",
        "confidence": 0.98,
        "boundingBox": {
          "x": 10,
          "y": 20,
          "width": 100,
          "height": 30
        }
      }
    ]
  }
}
```

### Extract Structured Data

#### POST /api/ocr/structured

Extract specific fields from an image.

**Request Body:**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "fields": ["name", "email", "phone", "address"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
}
```

---

## Automation Actions Reference

### Action Types

| Action | Description |
|--------|-------------|
| `navigate` | Navigate to a URL |
| `click` | Click an element |
| `type` | Type text into an input |
| `wait` | Wait for element or time |
| `extract` | Extract text from element |
| `screenshot` | Take a screenshot |
| `scroll` | Scroll page or to element |
| `select` | Select dropdown option |
| `executeScript` | Execute JavaScript |
| `llmAnalyze` | Analyze page with LLM |
| `ocrExtract` | Extract text via OCR |

### Step Schema

```typescript
{
  id: string;              // Unique step identifier
  action: ActionType;      // Action to perform
  selector?: string;       // CSS selector (required for most actions)
  value?: string;          // Value/URL/script (depends on action)
  waitTime?: number;       // Wait time in milliseconds
  outputVariable?: string; // Variable name to store result
  condition?: string;      // Conditional execution (future)
}
```

### Examples

#### Navigate
```json
{
  "id": "1",
  "action": "navigate",
  "value": "https://example.com"
}
```

#### Click
```json
{
  "id": "2",
  "action": "click",
  "selector": "button.submit"
}
```

#### Type
```json
{
  "id": "3",
  "action": "type",
  "selector": "input[name='email']",
  "value": "user@example.com"
}
```

#### Wait for Element
```json
{
  "id": "4",
  "action": "wait",
  "selector": ".loading-complete",
  "waitTime": 5000
}
```

#### Wait for Time
```json
{
  "id": "5",
  "action": "wait",
  "waitTime": 2000
}
```

#### Extract Text
```json
{
  "id": "6",
  "action": "extract",
  "selector": "h1.title",
  "outputVariable": "pageTitle"
}
```

#### Screenshot
```json
{
  "id": "7",
  "action": "screenshot",
  "outputVariable": "screenshot"
}
```

#### Scroll to Element
```json
{
  "id": "8",
  "action": "scroll",
  "selector": ".footer"
}
```

#### Scroll by Amount
```json
{
  "id": "9",
  "action": "scroll",
  "value": "1000"
}
```

#### Select Dropdown
```json
{
  "id": "10",
  "action": "select",
  "selector": "select#country",
  "value": "US"
}
```

#### Execute Script
```json
{
  "id": "11",
  "action": "executeScript",
  "value": "document.querySelectorAll('a').length",
  "outputVariable": "linkCount"
}
```

#### LLM Analyze
```json
{
  "id": "12",
  "action": "llmAnalyze",
  "value": "Extract all product names and prices as JSON",
  "outputVariable": "products"
}
```

#### OCR Extract
```json
{
  "id": "13",
  "action": "ocrExtract",
  "outputVariable": "ocrText"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (task doesn't exist) |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting based on your needs.

---

## Authentication

Currently, no authentication is required. For production use, implement API key authentication or OAuth.

Example future implementation:
```http
Authorization: Bearer your-api-key
```

---

## Webhooks (Future Feature)

Future support for webhooks when tasks complete:

```json
{
  "webhookUrl": "https://your-server.com/webhook",
  "events": ["task.completed", "task.failed"]
}
```

---

## Best Practices

1. **Error Handling**: Always check the `success` field in responses
2. **Timeouts**: Set appropriate wait times for slow-loading pages
3. **Selectors**: Use specific selectors to avoid ambiguity
4. **Variables**: Use descriptive names for output variables
5. **Testing**: Test tasks with small datasets first
6. **API Keys**: Keep your LLM and OCR API keys secure
7. **Rate Limits**: Be mindful of API rate limits for LLM and OCR services
