import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/messaging/test-wigal-direct
 * Test the Wigal SMS API directly with the correct URL
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Test Wigal Direct endpoint called');

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    const { phoneNumber, message, apiKey, apiSecret, senderId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Normalize the phone number
    let normalizedPhone = phoneNumber;
    if (normalizedPhone.startsWith('+')) {
      normalizedPhone = normalizedPhone.substring(1);
    }

    // Use the correct Wigal API endpoint
    const url = 'https://frogapi.wigal.com.gh/api/v3/sms/send';

    // Prepare the request body according to Wigal API documentation
    const requestBody = {
      senderid: senderId || 'ChurchCMS',
      destinations: [
        {
          destination: normalizedPhone,
          msgid: `MSG${Date.now()}` // Generate a unique message ID
        }
      ],
      message: message,
      smstype: 'text'
    };

    console.log('Sending direct Wigal SMS with:', {
      url,
      recipients: [normalizedPhone],
      sender: senderId || 'ChurchCMS',
      messageLength: message.length,
      apiKeyPresent: !!apiKey,
      apiSecretPresent: !!apiSecret
    });

    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'USERNAME': apiSecret || 'default', // Use apiSecret as username or default
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(requestBody),
    });

    // Get the response text
    const responseText = await response.text();
    console.log('Wigal API response text:', responseText);

    // Try to parse the JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Wigal API response:', parseError);
      return NextResponse.json(
        { success: false, error: `Failed to parse Wigal API response: ${responseText}` },
        { status: 500 }
      );
    }

    // Check for API-specific error responses
    if (data.status !== 'ACCEPTD' || !response.ok) {
      console.error('Wigal API error response:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || `Wigal API error: ${response.status} ${response.statusText}`,
          response: data
        },
        { status: response.ok ? 200 : 500 }
      );
    }

    // Handle successful response
    console.log('Wigal API success response:', data);
    return NextResponse.json({
      success: true,
      messageId: requestBody.destinations[0].msgid,
      message: data.message || "Message sent successfully",
      response: data
    });
  } catch (error) {
    console.error('Error in test-wigal-direct endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test Wigal SMS',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
