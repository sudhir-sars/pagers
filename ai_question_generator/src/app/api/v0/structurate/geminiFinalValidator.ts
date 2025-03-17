import { validatorSchema, buildFinalValidatorPrompt } from "./prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", 
  generationConfig: {
    responseMimeType: "application/json", 
    responseSchema: validatorSchema,
    temperature:0.2
  },
  
});


export async function geminiFinalValidator(question: any): Promise<{isValid:boolean, summary:string}> {
  try {
    console.log("in final validator")
    
    const questionString = JSON.stringify(question);

    const prompt = buildFinalValidatorPrompt(questionString);

    const generationResult = await model.generateContent(prompt);
    const responseText = generationResult.response.text();
    const validStructeedOutput=JSON.parse(responseText)

    if (validStructeedOutput && typeof validStructeedOutput.isValid === "boolean") {
      if (!validStructeedOutput) {
        console.error("Validation failed for question:", question);
      }
      console.log("validation sucess: ",validStructeedOutput)
      return validStructeedOutput;
    } else {
      console.error("Unexpected validation response format:", validStructeedOutput);
      return {isValid:false, summary:"none"};
    }
  } catch (error) {
    console.error("Error during question validation:", error);
    return {isValid:false, summary:"none"};
  }
}
