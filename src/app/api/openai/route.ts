import { NextResponse } from 'next/server';

interface PromiseDetectionRequest {
  message: string;
  previousMessages?: Array<{
    id: string;
    text: string;
    sender: string;
    userId: string;
    timestamp: string;
    conversationId: string;
  }>;
  source?: 'slack' | 'gmail';
}

interface DetectedPromise {
  requester: string;
  requestText: string;
  fullRequestText: string;
  commitmentText: string;
}

interface PromiseDetectionResponse {
  promises: Array<{
    from: string;
    text: string;
    date: string;
    source: string;
    isIncomingRequest: boolean;
    fullText: string;
    commitmentText: string;
    avatarURL?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body: PromiseDetectionRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the messages for OpenAI
    const messages = buildChatMessages(body.message, body.previousMessages, body.source);

    // Call OpenAI API
    const result = await makeOpenAIRequest(apiKey, messages);
    
    // Format the response in the expected format for the iOS app
    const responsePromises = result.promises.map(promise => ({
      id: crypto.randomUUID().toLowerCase(),
      from: promise.requester,
      text: promise.requestText,
      date: new Date().toISOString(),
      source: body.source || 'slack',
      isIncomingRequest: false,
      fullText: promise.fullRequestText,
      commitmentText: promise.commitmentText
    }));

    return NextResponse.json({ promises: responsePromises });
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to process message with OpenAI' },
      { status: 500 }
    );
  }
}

function buildChatMessages(
  currentMessage: string,
  previousMessages?: PromiseDetectionRequest['previousMessages'],
  source: string = 'slack'
) {
  const systemPrompt = `You are an AI assistant designed to extract information about promises made in conversations.
  Your primary task is to detect when someone makes a promise or commitment (using phrases like "I will", "I'll", "I can", "sure", "will do", "on it", etc.).

  IMPORTANT: If the current message contains a promise or commitment and there's no clear context about what was requested, still extract it by making a reasonable guess based on the promise itself.

  IMPORTANT: For a given conversation thread, ONLY return the MOST RECENT or STRONGEST commitment. Do not return multiple commitments from the same person in the same thread. If someone makes multiple statements like "I'll handle it" and later "I'll get it done tomorrow", only return the last/most specific one.

  Analyze the conversation context to determine:
  1. Requester: The person who made the original request or asked for the task (or "Unknown" if unclear)
  2. RequestText: Create a concise, clear summary of what was requested/needed (max 10 words)
  3. FullRequestText: The original text of the request (or a reasonable guess based on the promise)
  4. CommitmentText: The text where the user made the commitment
  5. Be mindful of long threads and try to determine the actual request and actual commitment to do it.

  BE VERY GENEROUS IN CONSIDERING STATEMENTS AS PROMISES. Even simple affirmative responses like:
  - "Sure"
  - "Will do"
  - "On it"
  - "I'll take care of it"
  - "I can do that"
  - "Yes"
  - "Ok"
  Should be treated as promises, even if brief.

  Format your response as JSON:
  {
    "promises": [
      {
        "requester": "string",
        "requestText": "string",
        "fullRequestText": "string",
        "commitmentText": "string"
      }
    ]
  }

  If no promises are detected, return an empty array.`;

  const messages = [
    { role: "system", content: systemPrompt }
  ];

  // Add context messages if available
  if (previousMessages && previousMessages.length > 0) {
    const maxContextMessages = 25;
    const contextMessages = previousMessages.slice(0, maxContextMessages);
    
    for (const msg of contextMessages) {
      const lowerText = msg.text.toLowerCase();
      const isRequest = msg.text.trim().endsWith("?") ||
        lowerText.includes("can you") ||
        lowerText.includes("could you") ||
        lowerText.includes("please") ||
        lowerText.includes("would you") ||
        lowerText.includes("will you");
      
      const formatted = isRequest 
        ? `[REQUEST] ${msg.sender}: ${msg.text}` 
        : `${msg.sender}: ${msg.text}`;
      
      messages.push({
        role: "user",
        content: formatted
      });
    }
  }

  // Add current message
  messages.push({ role: "user", content: currentMessage });

  return messages;
}

async function makeOpenAIRequest(apiKey: string, messages: Array<{ role: string, content: string }>) {
  const model = "gpt-4o-mini"; // Can be configured from environment variables

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("Invalid response from OpenAI");
  }

  // Try to parse the JSON response
  try {
    return JSON.parse(content) as { promises: DetectedPromise[] };
  } catch (error) {
    // Fallback JSON extraction if the model wrapped the JSON in text
    const extracted = extractJSON(content);
    if (extracted) {
      return JSON.parse(extracted) as { promises: DetectedPromise[] };
    }
    throw new Error("Failed to parse JSON response from OpenAI");
  }
}

function extractJSON(text: string) {
  // Look for the first '{' and the last '}'
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return null;
  }
  
  return text.substring(startIndex, endIndex + 1);
} 