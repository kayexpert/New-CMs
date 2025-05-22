import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase-api';

/**
 * POST /api/messaging/ai/setup-openai
 * Sets up OpenAI configuration with the provided API key
 */
export async function POST(request: NextRequest) {
  try {
    // OpenAI API key (hardcoded for simplicity in this example)
    const apiKey = "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";

    // Default prompt for rephrasing
    const defaultPrompt = "You are an expert at rephrasing text messages. Take the user's message and rephrase it to be clear, concise, and engaging while preserving the original meaning. The output must be under 160 characters. Don't just shorten the message - rewrite it completely while keeping the core message intact.";

    // Check if a default configuration exists
    const { data: existingConfig, error: fetchError } = await supabaseApi
      .from('ai_configurations')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching AI configuration:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch AI configuration', details: fetchError },
        { status: 500 }
      );
    }

    let result;

    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabaseApi
        .from('ai_configurations')
        .update({
          ai_provider: 'openai',
          api_key: apiKey,
          default_prompt: defaultPrompt
        })
        .eq('id', existingConfig.id)
        .select();

      if (error) {
        console.error('Error updating AI configuration:', error);
        return NextResponse.json(
          { error: 'Failed to update AI configuration', details: error },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new configuration
      const { data, error } = await supabaseApi
        .from('ai_configurations')
        .insert({
          ai_provider: 'openai',
          api_key: apiKey,
          default_prompt: defaultPrompt,
          character_limit: 160,
          is_default: true
        })
        .select();

      if (error) {
        console.error('Error creating AI configuration:', error);
        return NextResponse.json(
          { error: 'Failed to create AI configuration', details: error },
          { status: 500 }
        );
      }

      result = data;
    }

    // Return success without exposing the API key
    return NextResponse.json({
      success: true,
      message: 'OpenAI configuration set up successfully',
      data: {
        ai_provider: result?.[0]?.ai_provider || 'openai',
        is_default: result?.[0]?.is_default || true,
        character_limit: result?.[0]?.character_limit || 160
      }
    });
  } catch (error) {
    console.error('Error in POST /api/messaging/ai/setup-openai:', error);
    return NextResponse.json(
      { error: 'Failed to set up OpenAI configuration', details: error },
      { status: 500 }
    );
  }
}
