/**
 * Script to update the AI configuration with OpenAI API key
 * Run this script with: node src/scripts/update-openai-config.js
 *
 * IMPORTANT: This script contains sensitive API keys. Do not commit this file with actual keys.
 * After running the script, either delete it or remove the API key.
 */

async function updateOpenAIConfig() {
  try {
    // Get the base URL from environment or use localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY || '';

    console.log('Updating AI configuration with OpenAI API key...');

    // Call the update config endpoint
    const response = await fetch(`${baseUrl}/api/messaging/ai/update-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ai_provider: 'openai',
        api_key: apiKey,
        default_prompt: "You are an expert at rephrasing text messages. Take the user's message and rephrase it to be clear, concise, and engaging while preserving the original meaning. The output must be under 160 characters. Don't just shorten the message - rewrite it completely while keeping the core message intact."
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update AI configuration');
    }

    console.log('Success:', data.message);
    console.log('Configuration:', data.data);

    // SECURITY REMINDER
    console.log('\n⚠️ IMPORTANT SECURITY REMINDER ⚠️');
    console.log('This script contains your OpenAI API key.');
    console.log('Please either:');
    console.log('1. Delete this file after use, or');
    console.log('2. Remove the API key from this file');
    console.log('Never commit API keys to version control!');
  } catch (error) {
    console.error('Error updating AI configuration:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  updateOpenAIConfig();
}

module.exports = { updateOpenAIConfig };
