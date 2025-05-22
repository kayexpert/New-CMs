/**
 * Script to set up AI configuration tables
 * Run this script with: node src/scripts/setup-ai-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupAITables() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration. Please check your .env file.');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Setting up AI configuration tables...');
    
    // Create ai_configurations table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ai_configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ai_provider TEXT NOT NULL CHECK (ai_provider IN ('default', 'openai', 'custom')),
          api_key TEXT,
          api_endpoint TEXT,
          default_prompt TEXT NOT NULL DEFAULT 'Rephrase this message to be clear, concise, and engaging while preserving its core meaning. The output must be under 160 characters.',
          character_limit INTEGER NOT NULL DEFAULT 160,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createTableError) {
      console.error('Error creating ai_configurations table:', createTableError);
      
      // Try direct insertion as a fallback
      console.log('Trying direct insertion...');
      
      // Check if the table exists
      const { data: tableExists, error: checkError } = await supabase
        .from('ai_configurations')
        .select('count(*)')
        .limit(1);
      
      if (checkError) {
        console.error('Error checking if table exists:', checkError);
        return;
      }
      
      console.log('Table exists, proceeding with configuration...');
    }
    
    // Check if a default configuration exists
    const { data: existingConfig, error: fetchError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching AI configuration:', fetchError);
      return;
    }
    
    if (existingConfig) {
      console.log('Default AI configuration already exists:', existingConfig.id);
      
      // Update the existing configuration
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({
          ai_provider: 'openai',
          api_key: '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',
          default_prompt: "You are an expert at rephrasing text messages. Take the user's message and rephrase it to be clear, concise, and engaging while preserving the original meaning. The output must be under 160 characters. Don't just shorten the message - rewrite it completely while keeping the core message intact."
        })
        .eq('id', existingConfig.id);
      
      if (updateError) {
        console.error('Error updating AI configuration:', updateError);
        return;
      }
      
      console.log('AI configuration updated successfully');
    } else {
      console.log('No default AI configuration found, creating one...');
      
      // Create a new configuration
      const { error: insertError } = await supabase
        .from('ai_configurations')
        .insert({
          ai_provider: 'openai',
          api_key: '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',
          default_prompt: "You are an expert at rephrasing text messages. Take the user's message and rephrase it to be clear, concise, and engaging while preserving the original meaning. The output must be under 160 characters. Don't just shorten the message - rewrite it completely while keeping the core message intact.",
          character_limit: 160,
          is_default: true
        });
      
      if (insertError) {
        console.error('Error creating AI configuration:', insertError);
        return;
      }
      
      console.log('AI configuration created successfully');
    }
    
    // SECURITY REMINDER
    console.log('\n⚠️ IMPORTANT SECURITY REMINDER ⚠️');
    console.log('This script contains your OpenAI API key.');
    console.log('Please either:');
    console.log('1. Delete this file after use, or');
    console.log('2. Remove the API key from this file');
    console.log('Never commit API keys to version control!');
  } catch (error) {
    console.error('Error setting up AI tables:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  setupAITables();
}

module.exports = { setupAITables };
