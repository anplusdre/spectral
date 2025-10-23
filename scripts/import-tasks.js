const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function importTasks(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.error('Invalid file format. Expected { "tasks": [...] }');
      process.exit(1);
    }

    console.log(`Importing ${data.tasks.length} tasks...`);

    for (const task of data.tasks) {
      try {
        const response = await axios.post(`${API_BASE}/tasks`, task);
        
        if (response.data.success) {
          console.log(`✓ Imported: ${task.name} (ID: ${response.data.data.id})`);
        } else {
          console.error(`✗ Failed: ${task.name} - ${response.data.error}`);
        }
      } catch (error) {
        console.error(`✗ Failed: ${task.name} - ${error.message}`);
      }
    }

    console.log('\nImport completed!');
  } catch (error) {
    console.error('Error reading file:', error.message);
    process.exit(1);
  }
}

const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node import-tasks.js <path-to-tasks.json>');
  console.log('Example: node import-tasks.js ../examples/sample-tasks.json');
  process.exit(1);
}

importTasks(path.resolve(filePath));
