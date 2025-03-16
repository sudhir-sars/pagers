import { validatorSchema, buildValidatorPrompt } from "./prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro", 
  generationConfig: {
    responseMimeType: "application/json", 
    responseSchema: validatorSchema,
    temperature:0.2
  },
  
});


export async function geminiVaidator(question: any): Promise<{isValid:boolean, summary:string}> {
  try {
    
    const questionString = JSON.stringify(question);

    const prompt = buildValidatorPrompt(questionString);

    const generationResult = await model.generateContent(prompt);
    const responseText = generationResult.response.text();
    const validStructeedOutput=JSON.parse(responseText)

    if (validStructeedOutput && typeof validStructeedOutput.isValid === "boolean") {
      if (!validStructeedOutput) {
        console.error("Validation failed for question:", question);
      }
      return validStructeedOutput;
    } else {
      console.error("Unexpected validation response format:", validStructeedOutput);
      return false;
    }
  } catch (error) {
    console.error("Error during question validation:", error);
    return false;
  }
}
