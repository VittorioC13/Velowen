/**
 * Test World Labs API with text prompt (simplest case)
 */

import dotenv from 'dotenv';
dotenv.config();

const WORLD_LABS_API_KEY = process.env.WORLD_LABS_API_KEY;
const BASE_URL = 'https://api.worldlabs.ai';

async function testTextPrompt() {
  console.log('🚀 Testing World Labs API with text prompt');

  try {
    const response = await fetch(`${BASE_URL}/marble/v1/worlds:generate`, {
      method: 'POST',
      headers: {
        'WLT-Api-Key': WORLD_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name: 'Test Text Prompt',
        model: 'Marble 0.1-mini',
        world_prompt: {
          type: 'text',
          text_prompt: 'a cozy anime bedroom with bookshelves',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error:', error);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Success!');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTextPrompt();
