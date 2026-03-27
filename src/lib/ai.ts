/**
 * Utility for interacting with the Google Gemini AI API.
 * 
 * WARNING: Calling this from the frontend exposes your API key.
 * For production apps, this should be handled by a secure backend.
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

const API_CONFIGS = [
  { version: "v1beta", model: "gemini-pro" },
  { version: "v1beta", model: "gemini-1.5-flash" },
  { version: "v1", model: "gemini-1.5-flash" },
  { version: "v1", model: "gemini-pro" },
  { version: "v1beta", model: "gemini-1.5-flash-latest" },
  { version: "v1beta", model: "gemini-1.0-pro" },
];

const RECENT_SUCCESSFUL_MODEL_KEY = "last_successful_ai_model";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  // 1. Try the last successful model first to save time
  const cached = localStorage.getItem(RECENT_SUCCESSFUL_MODEL_KEY);
  const configs = cached ? [JSON.parse(cached), ...API_CONFIGS] : API_CONFIGS;
  
  let lastError = "";

  for (const config of configs) {
    const url = `${GEMINI_API_BASE}/${config.version}/models/${config.model}:generateContent`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey 
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          localStorage.setItem(RECENT_SUCCESSFUL_MODEL_KEY, JSON.stringify(config));
          return text.trim();
        }
      } else {
        const errorData = await response.json();
        const msg = errorData.error?.message || "Unknown error";
        console.warn(`Gemini trial (${config.model} - ${config.version}) failed: ${msg}`);
        lastError = msg;
        
        // If it's 401/403, don't keep trying models, it's a key issue
        if (response.status === 401 || response.status === 403) throw new Error(msg);
      }
    } catch (error: any) {
      if (error.message.includes("401") || error.message.includes("403")) throw error;
      lastError = error.message;
    }
  }

  // 2. If all failed, let's try to list models to diagnose
  try {
    const models = await listModels(apiKey);
    if (models.length > 0) {
      throw new Error(`Model 404. Your key supports: ${models.slice(0, 3).join(", ")}. Try updating your settings!`);
    }
  } catch (e) {
    // ignore list failure
  }

  throw new Error(lastError || "All models failed. Check your API key permissions.");
}

async function listModels(apiKey: string): Promise<string[]> {
  try {
    const url = `${GEMINI_API_BASE}/v1beta/models`;
    const response = await fetch(url, {
      headers: { "x-goog-api-key": apiKey }
    });
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((m: any) => m.name.replace('models/', '')) || [];
    }
  } catch (e) {}
  return [];
}

export async function testAI(apiKey: string): Promise<string> {
  try {
    const models = await listModels(apiKey);
    const availableStr = models.length > 0 ? ` (Supported: ${models.slice(0, 3).join(", ")})` : "";
    
    const result = await callGemini(apiKey, "Say 'System Online'");
    return `AI Success! ${result}${availableStr}`;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

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

  return await callGemini(apiKey, prompt);
}
