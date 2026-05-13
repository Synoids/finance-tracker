import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-pro-latest"
];

let cachedWorkingModel: string | null = null;

export async function getResilientModel(genAI: GoogleGenerativeAI): Promise<{ model: GenerativeModel; name: string }> {
  // If we already found a working model in this session, use it
  if (cachedWorkingModel) {
    return { 
      model: genAI.getGenerativeModel({ model: cachedWorkingModel }), 
      name: cachedWorkingModel 
    };
  }

  console.log("[Gemini] Resolving working model...");

  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Quick test to see if model exists and is reachable
      // We use a very short prompt to minimize tokens
      await model.generateContent("ping"); 
      
      console.log(`[Gemini] ✅ Model ${modelName} confirmed working.`);
      cachedWorkingModel = modelName;
      return { model, name: modelName };
    } catch (error: any) {
      const status = error?.status || "Unknown";
      console.warn(`[Gemini] ❌ Model ${modelName} unavailable (Status: ${status}). Error: ${error.message}`);
      continue;
    }
  }

  throw new Error("All configured Gemini models failed to initialize.");
}
