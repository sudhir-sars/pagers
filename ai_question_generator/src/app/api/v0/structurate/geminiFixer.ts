import { GoogleGenerativeAI } from "@google/generative-ai";
import { fixerResponseSchema } from "./prompts";
import { buildFixerPrompt } from "./prompts";


const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: fixerResponseSchema, // Default schema, will override per call if needed
    temperature: 0.2,
  },
});

export async function geminiFixer(invalidQuestion: any, validationSummary: string,subject:string): Promise<any> {
  const prompt = buildFixerPrompt(invalidQuestion, validationSummary,subject);
  try {
    const generationResult = await model.generateContent(prompt);
    const responseText = await generationResult.response.text();
    const correctedQuestion = JSON.parse(responseText);
    return correctedQuestion;
  } catch (error) {
    console.error("Error in geminiFixer:", "error");
    return invalidQuestion; // Return original question if fixing fails
  }
}