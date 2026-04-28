const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(data.models.map(m => m.name).filter(name => name.includes('flash')));
}

listModels();
