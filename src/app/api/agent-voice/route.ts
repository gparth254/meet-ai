import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { instructions, userText } = await request.json();

    if (!instructions || !userText) {
      console.error("Missing required fields:", { instructions: !!instructions, userText: !!userText });
      return NextResponse.json(
        { error: "Missing instructions or user text" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key") {
      console.error("OPENAI_API_KEY not configured properly");
      return NextResponse.json(
        { 
          agentReply: "OpenAI API key not configured. Please set a valid OPENAI_API_KEY in your .env.local file.",
          error: "OPENAI_API_KEY not configured"
        },
        { status: 500 }
      );
    }

    console.log("Making OpenAI API request with:", { 
      instructions: instructions.substring(0, 100) + "...", 
      userText: userText.substring(0, 100) + "..." 
    });

    // Use fetch to call OpenAI API directly
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: userText },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      
      let errorMessage = "Sorry, I couldn't connect to the AI service. Please try again.";
      
      if (response.status === 401) {
        errorMessage = "OpenAI API key is invalid. Please check your API key configuration.";
      } else if (response.status === 429) {
        errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
      } else if (response.status === 500) {
        errorMessage = "OpenAI service is temporarily unavailable. Please try again.";
      }
      
      return NextResponse.json(
        { 
          agentReply: errorMessage,
          error: `OpenAI API error: ${response.status}`
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const agentReply = data.choices?.[0]?.message?.content || "Sorry, I didn't understand.";

    console.log("OpenAI response successful:", { 
      userText: userText.substring(0, 50) + "...", 
      agentReply: agentReply.substring(0, 50) + "..." 
    });
    
    return NextResponse.json({ agentReply });
    
  } catch (error) {
    console.error("Agent voice API error:", error);
    return NextResponse.json(
      { 
        agentReply: "Sorry, I couldn't respond right now. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 