import { NextRequest, NextResponse } from 'next/server';
import { personalizeMessage } from '@/utils/message-utils';

/**
 * POST /api/messaging/test-personalization
 * Test the personalization function with sample data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { content = 'Hello {first_name}, welcome to {church}!' } = body;

    // Create a sample member
    const sampleMember = {
      id: 'test-id',
      first_name: 'John',
      last_name: 'Doe',
      primary_phone_number: '+233123456789',
      email: 'john.doe@example.com',
      status: 'active'
    };

    // Personalize the message
    const personalizedContent = personalizeMessage(content, sampleMember);

    // Return the result
    return NextResponse.json({
      success: true,
      original: content,
      personalized: personalizedContent,
      tokens: {
        first_name: sampleMember.first_name,
        last_name: sampleMember.last_name,
        name: `${sampleMember.first_name} ${sampleMember.last_name}`
      }
    });
  } catch (error) {
    console.error('Error in test-personalization endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
