import { geminiSchema, buildPrompt } from "../prompts";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { geminiVaidator } from "../geminiValidator";
import { Question } from "@/model/Question";
import dbConnect from "@/lib/mongo";

const apiKey = process.env.GEMINI_API_KEY!;
await dbConnect();
const genAI = new GoogleGenerativeAI(apiKey);

const questionsSchema: ArraySchema = {
  description: "List of questions",
  type: SchemaType.ARRAY,
  items: geminiSchema,
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
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
    const questions = JSON.parse(responseText);
    
    const savedQuestions = [];
    for (const question of questions) {
      const { isValid, summary } = await geminiVaidator(question);
      const questionData = {
        subject: question.subject,
        content: question.question_content,
        options: question.options.map((opt: any) => ({
          option_id: opt.option_id.toString(),
          content: opt.option_content,
        })),
        solution: {
          answer: question.solution.answer,
          explanation: question.solution.explanation,
        },
        difficulty_level: question.difficulty_level,
        validation: isValid,
        summary:summary
      };
      console.log(questionData);
      const saved = await Question.create(questionData);
      savedQuestions.push(saved);
    }
    
    return NextResponse.json({ success: true, questions: savedQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
