# API Usage Examples

This document provides practical examples of using the AI Automation Browser API.

## Prerequisites

Ensure the API server is running:
```bash
npm start
# API Server running on http://localhost:3000
```

## Task Management

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Task",
    "description": "A simple navigation task",
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
        "action": "screenshot",
        "outputVariable": "page"
      }
    ]
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Get Tasks by Status

```bash
curl http://localhost:3000/api/tasks?status=completed
```

### Get Task by ID

```bash
curl http://localhost:3000/api/tasks/YOUR_TASK_ID
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/api/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Task Name",
    "status": "pending"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/YOUR_TASK_ID
```

### Get Task Results

```bash
curl http://localhost:3000/api/tasks/YOUR_TASK_ID/results?limit=5
```

## LLM API

### Chat with LLM

```bash
curl -X POST http://localhost:3000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain what browser automation is in simple terms",
    "systemPrompt": "You are a helpful technical assistant",
    "temperature": 0.7,
    "maxTokens": 500
  }'
```

### Analyze Text

```bash
curl -X POST http://localhost:3000/api/llm/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This product is amazing! Best purchase ever. Highly recommend.",
    "instruction": "Analyze the sentiment of this review and provide a score from 1-10"
  }'
```

### Extract Data from HTML

```bash
curl -X POST http://localhost:3000/api/llm/extract \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"product\"><h1>Laptop XYZ</h1><span class=\"price\">$999</span><p>Great laptop for developers</p></div>",
    "schema": {
      "name": "Product name",
      "price": "Product price",
      "description": "Product description"
    }
  }'
```

### Generate Automation Steps

```bash
curl -X POST http://localhost:3000/api/llm/generate-steps \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Go to GitHub, search for electron projects, and click on the first result"
  }'
```

## OCR API

### Extract Text from Image URL

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image-with-text.jpg",
    "language": "en"
  }'
```

### Extract Text from Base64 Image

```bash
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "language": "en"
  }'
```

### Extract Structured Data from Image

```bash
curl -X POST http://localhost:3000/api/ocr/structured \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "YOUR_BASE64_ENCODED_IMAGE",
    "fields": ["name", "email", "phone", "address"]
  }'
```

## Python Examples

### Using Python Requests

```python
import requests
import json

API_BASE = "http://localhost:3000/api"

# Create a task
def create_task():
    task_data = {
        "name": "Python Automation Task",
        "description": "Created via Python",
        "steps": [
            {
                "id": "1",
                "action": "navigate",
                "value": "https://example.com"
            },
            {
                "id": "2",
                "action": "screenshot",
                "outputVariable": "screenshot"
            }
        ]
    }
    
    response = requests.post(f"{API_BASE}/tasks", json=task_data)
    return response.json()

# Get all tasks
def get_tasks():
    response = requests.get(f"{API_BASE}/tasks")
    return response.json()

# Chat with LLM
def chat_with_llm(prompt):
    data = {
        "prompt": prompt,
        "temperature": 0.7
    }
    
    response = requests.post(f"{API_BASE}/llm/chat", json=data)
    return response.json()

# OCR extraction
def extract_text_from_image(image_url):
    data = {
        "imageUrl": image_url,
        "language": "en"
    }
    
    response = requests.post(f"{API_BASE}/ocr/extract", json=data)
    return response.json()

# Example usage
if __name__ == "__main__":
    # Create a task
    task = create_task()
    print(f"Created task: {task['data']['id']}")
    
    # Get all tasks
    tasks = get_tasks()
    print(f"Total tasks: {len(tasks['data'])}")
    
    # Chat with LLM
    llm_response = chat_with_llm("What is browser automation?")
    print(f"LLM says: {llm_response['data']['content']}")
```

## JavaScript/Node.js Examples

### Using Axios

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Create a task
async function createTask() {
  const taskData = {
    name: 'JavaScript Automation Task',
    description: 'Created via JavaScript',
    steps: [
      {
        id: '1',
        action: 'navigate',
        value: 'https://example.com'
      },
      {
        id: '2',
        action: 'screenshot',
        outputVariable: 'screenshot'
      }
    ]
  };
  
  const response = await axios.post(`${API_BASE}/tasks`, taskData);
  return response.data;
}

// Get all tasks
async function getTasks() {
  const response = await axios.get(`${API_BASE}/tasks`);
  return response.data;
}

// Chat with LLM
async function chatWithLLM(prompt) {
  const data = {
    prompt,
    temperature: 0.7
  };
  
  const response = await axios.post(`${API_BASE}/llm/chat`, data);
  return response.data;
}

// OCR extraction
async function extractTextFromImage(imageUrl) {
  const data = {
    imageUrl,
    language: 'en'
  };
  
  const response = await axios.post(`${API_BASE}/ocr/extract`, data);
  return response.data;
}

// Example usage
async function main() {
  try {
    // Create a task
    const task = await createTask();
    console.log(`Created task: ${task.data.id}`);
    
    // Get all tasks
    const tasks = await getTasks();
    console.log(`Total tasks: ${tasks.data.length}`);
    
    // Chat with LLM
    const llmResponse = await chatWithLLM('What is browser automation?');
    console.log(`LLM says: ${llmResponse.data.content}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Advanced Examples

### Chaining Tasks with Data Flow

```bash
# Step 1: Navigate and extract data
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Extract Product Info",
    "steps": [
      {
        "id": "1",
        "action": "navigate",
        "value": "https://example-shop.com/product/123"
      },
      {
        "id": "2",
        "action": "llmAnalyze",
        "value": "Extract product name, price, and availability status as JSON",
        "outputVariable": "productData"
      }
    ]
  }'

# Step 2: Use extracted data in another request
# (Use the task ID from the first response to get results)
curl http://localhost:3000/api/tasks/TASK_ID/results
```

### Batch OCR Processing

```python
import requests
import os
import base64

API_BASE = "http://localhost:3000/api"

def process_images_in_folder(folder_path):
    results = []
    
    for filename in os.listdir(folder_path):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            with open(os.path.join(folder_path, filename), 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
                
            response = requests.post(
                f"{API_BASE}/ocr/extract",
                json={
                    "imageBase64": f"data:image/png;base64,{image_data}",
                    "language": "en"
                }
            )
            
            results.append({
                "filename": filename,
                "text": response.json()['data']['text']
            })
    
    return results

# Process all images
results = process_images_in_folder('./images')
for result in results:
    print(f"{result['filename']}: {result['text'][:100]}...")
```

### Automated Testing Workflow

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function runTestSuite() {
  const testCases = [
    {
      name: 'Homepage Load Test',
      url: 'https://example.com',
      expectedText: 'Welcome'
    },
    {
      name: 'Login Page Test',
      url: 'https://example.com/login',
      expectedText: 'Sign In'
    }
  ];
  
  const results = [];
  
  for (const test of testCases) {
    const task = await axios.post(`${API_BASE}/tasks`, {
      name: test.name,
      steps: [
        {
          id: '1',
          action: 'navigate',
          value: test.url
        },
        {
          id: '2',
          action: 'wait',
          waitTime: 2000
        },
        {
          id: '3',
          action: 'extract',
          selector: 'body',
          outputVariable: 'content'
        }
      ]
    });
    
    results.push({
      test: test.name,
      taskId: task.data.data.id,
      status: 'created'
    });
  }
  
  return results;
}

runTestSuite()
  .then(results => console.log('Test suite created:', results))
  .catch(err => console.error('Error:', err));
```

## Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
