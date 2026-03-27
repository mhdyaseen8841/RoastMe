/**
 * Utility for interacting with the Google Gemini AI API.
 * 
 * WARNING: Calling this from the frontend exposes your API key.
 * For production apps, this should be handled by a secure backend.
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

const API_CONFIGS = [
  { version: "v1beta", model: "gemini-1.5-flash" },
  { version: "v1", model: "gemini-1.5-flash" },
  { version: "v1beta", model: "gemini-pro" },
  { version: "v1", model: "gemini-pro" },
  { version: "v1beta", model: "gemini-1.5-flash-latest" },
];

export async function generateAIRoast(apiKey: string, situaton: string, goal: string, tone: string): Promise<string> {
  const prompt = `
    You are a professional "Roast Master" productivity coach.
    Your goal is to roast the user into being more productive based on their current situation.
    
    USER GOAL: ${goal}
    USER TONE PREFERENCE: ${tone} (savage, funny, or sarcastic)
    CURRENT SITUATION: ${situaton}
    
    RULES:
    1. Be concise (max 2 sentences).
    2. Be funny but motivating in a ${tone} way.
    3. Refer to their specific goal to make it personal.
    4. Do not be overly mean; stay in the realm of "tough love".
    5. No emojis except for occasional fire or skull.
    
    ROAST:
  `.trim();

  let lastError = null;

  for (const config of API_CONFIGS) {
    const url = `${GEMINI_API_BASE}/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errorData = await response.json();
        console.warn(`Gemini trial (${config.model} on ${config.version}) failed:`, errorData.error?.message);
        lastError = errorData.error?.message;
      }
    } catch (error: any) {
      console.warn(`Network error for ${config.model}:`, error.message);
      lastError = error.message;
    }
  }

  throw new Error(lastError || "All AI models failed to respond. Check your internet or API key.");
}
