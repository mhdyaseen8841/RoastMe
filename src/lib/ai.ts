/**
 * Utility for interacting with the Google Gemini AI API.
 * 
 * WARNING: Calling this from the frontend exposes your API key.
 * For production apps, this should be handled by a secure backend.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

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

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "AI Request Failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("No roast generated");
    
    return text.trim();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
