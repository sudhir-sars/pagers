import { geminiSchema, buildPrompt } from "../prompts";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { geminiFinalValidator } from "../geminiFinalValidator";
import { geminiValidator } from "../geminiValidator";
import { Question } from "@/model/Question";
import dbConnect from "@/lib/mongo";
import { geminiFixer } from "../geminiFixer";
import { deepseekFixer } from "../deepseekFixer";

const apiKey = process.env.GEMINI_API_KEY!;
await dbConnect();
const genAI = new GoogleGenerativeAI(apiKey);

const questionsSchema: ArraySchema = {
  description: "List of questions",
  type: SchemaType.ARRAY,
  items: geminiSchema,
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: questionsSchema,
    temperature:0.2,
  },
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || "";
    const subcategory = url.searchParams.get("subcategory") || "";
    const topic = `${category} ${subcategory}`.trim();
    
    const prompt = buildPrompt(topic);
    const generationResult = await model.generateContent(prompt);
    const responseText = await generationResult.response.text();
    console.log(responseText)
    const questions = JSON.parse(responseText);
    
    const savedQuestions = [];
    for (const question of questions) {
      let finalQuestion = question;
      let { isValid, summary } = await geminiValidator(question);

      if (!isValid) {

        console.log(`Question invalid   ${question}: ${summary}. Attempting to fix.`);
        const fixerResponse = await geminiFixer(question, summary);
        // const fixerResponse = await deepseekFixer(question, summary);
        const correctedQuestion = fixerResponse.correctedQuestion;
        const fixSummary = fixerResponse.fixSummary;
        console.log("What is Fixed:", fixSummary);
        finalQuestion = correctedQuestion;
        const finalValidation = await geminiValidator(correctedQuestion);
        
        isValid = finalValidation.isValid;
        summary = finalValidation.summary;

        console.log("Final Verdict:", isValid);
        console.log("Final Summary:", summary);
      }

      let lastValidationobject

      if(isValid){
        console.log("in final call")
        lastValidationobject= await geminiFinalValidator(finalQuestion);
        isValid=lastValidationobject.isValid;
        if(!isValid){
          console.log("invalidated at final call :",finalQuestion);
        }
      }
      


      if(isValid){

        const questionData = {
          subject: finalQuestion.subject,
          content: finalQuestion.question_content,
          options: finalQuestion.options.map((opt: any) => ({
            option_id: opt.option_id.toString(),
            content: opt.option_content,
          })),
          solution: {
            answer: finalQuestion.solution.answer,
            explanation: finalQuestion.solution.explanation,
          },
          difficulty_level: finalQuestion.difficulty_level,
          validation: isValid,
          summary:summary
        };
        console.log(questionData);
        const saved = await Question.create(questionData);
        savedQuestions.push(saved);

      }
      
     
    }
    
    return NextResponse.json({ success: true, questions: savedQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
