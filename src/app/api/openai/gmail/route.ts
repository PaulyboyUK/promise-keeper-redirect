import { NextResponse } from 'next/server';

interface GmailThreadMessage {
  from: string;
  date: string;
  body: string;
}

interface CleanedEmailThread {
  messages: GmailThreadMessage[];
}

interface GmailPromiseDetectionRequest {
  thread: CleanedEmailThread;
  avatarMap?: Record<string, string | null>;
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
    const body: GmailPromiseDetectionRequest = await request.json();
    
    if (!body.thread || !body.thread.messages || body.thread.messages.length === 0) {
      return NextResponse.json(
        { error: 'Valid Gmail thread is required' },
        { status: 400 }
      );
    }

    // Build the messages for OpenAI
    const messages = buildGmailPrompt(body.thread);

    // Call OpenAI API
    const result = await makeOpenAIRequest(apiKey, messages);
    
    // Format the response in the expected format for the iOS app
    const responsePromises = result.promises.map(promise => {
      // Try to find avatarURL for the requester in the thread messages
      const avatarURL = findAvatarURL(promise.requester, body.avatarMap);
      
      return {
        id: crypto.randomUUID().toLowerCase(),
        from: promise.requester,
        text: promise.requestText,
        date: new Date().toISOString(),
        source: 'gmail',
        isIncomingRequest: false,
        fullText: promise.fullRequestText,
        commitmentText: promise.commitmentText,
        avatarURL
      };
    });

    return NextResponse.json({ promises: responsePromises });
  } catch (error) {
    console.error('Error in OpenAI Gmail API:', error);
    return NextResponse.json(
      { error: 'Failed to process Gmail thread with OpenAI' },
      { status: 500 }
    );
  }
}

function buildGmailPrompt(thread: CleanedEmailThread) {
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

  let userPrompt = "Below is an email thread. Extract relevant promises or commitments made by the participants. Where possible match the commitment to the correct request. Each message is separated by ---\n\n";
  
  for (const msg of thread.messages) {
    userPrompt += `From: ${msg.from}\nDate: ${msg.date}\nBody:\n${msg.body}\n---\n`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

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

function findAvatarURL(requester: string, avatarMap?: Record<string, string | null>): string | undefined {
  if (!avatarMap) {
    return undefined;
  }

  // Try direct match (display name or email)
  if (avatarMap[requester] !== undefined) {
    return avatarMap[requester] || undefined;
  }

  // Try case-insensitive match
  for (const [key, value] of Object.entries(avatarMap)) {
    if (key.toLowerCase() === requester.toLowerCase()) {
      return value || undefined;
    }
  }

  // Try to match by email if the requester looks like a name but an email exists in the map
  for (const [key, value] of Object.entries(avatarMap)) {
    if (key.includes('@')) {
      const emailUsername = key.split('@')[0].toLowerCase();
      if (requester.toLowerCase().includes(emailUsername)) {
        return value || undefined;
      }
    }
  }

  return undefined;
} 