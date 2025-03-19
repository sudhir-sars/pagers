import { geminiSchema, buildPrompt } from "../prompts";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { geminiFinalValidator } from "../geminiFinalValidator";
import { geminiValidator } from "../geminiValidator";
import { AiQuestion } from "@/model/AiQuestion";
import dbConnect from "@/lib/mongo";
import { geminiFixer } from "../geminiFixer";
import { QuestionDocument } from "@/model/AiQuestion";

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
    temperature: 0.2,
    maxOutputTokens: 10000,
  },
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || "";
    const subject = url.searchParams.get("subject") || "";
    const subcategory = url.searchParams.get("subcategory") || "";
    const topic = `${category} ${subcategory}`.trim();

    const basePrompt = buildPrompt(subject, topic);
    const prompt = `${basePrompt} Use the provided PDF document as context.`;

    const savedQuestions: QuestionDocument[] = [];
    let attempts = 0;
    let errorCount = 0;
    const maxAttempts = 20; // Allow multiple batches to reach 80 questions
    const maxErrors = 5; // Maximum of 5 errors before giving up

    // Loop until 80 questions, max attempts, or max errors
    while (savedQuestions.length < 20 && attempts < maxAttempts && errorCount < maxErrors) {
      attempts++;
      console.log(`Attempt ${attempts}: Generating questions for topic "${topic}"`);

      try {
        const generationResult = await model.generateContent(prompt);
        const responseText = await generationResult.response.text();
        const questions = JSON.parse(responseText);

        const processQuestion = async (question: any): Promise<QuestionDocument | null> => {
          try {
            let finalQuestion = question;
            let { isValid, summary } = await geminiValidator(question);

            if (!isValid) {
              const fixerResponse = await geminiFixer(question, summary, subject);
              finalQuestion = fixerResponse.correctedQuestion;
              const validationAfterFix = await geminiValidator(finalQuestion);
              isValid = validationAfterFix.isValid;
              summary = validationAfterFix.summary;
            }

            if (isValid) {
              // console.log("Performing final validation.");
              const finalValidationResult = await geminiFinalValidator(finalQuestion);
              isValid = finalValidationResult.isValid;
              if (!isValid) {
                // console.log("Final validation failed for question.");
                return null;
              }
            }

            if (isValid) {
              const questionData = {
                subject: finalQuestion.subject,
                topic: category,
                subtopic: subcategory,
                content: finalQuestion.question_content,
                options: finalQuestion.options.map((opt: any) => ({
                  option_id: opt.option_id.toString(),
                  content: opt.option_content,
                })),
                solution: {
                  answer: finalQuestion.solution.answer,
                  answer_id: finalQuestion.solution.answer_id,
                  explanation: finalQuestion.solution.explanation,
                },
                difficulty_level: finalQuestion.difficulty_level,
                validation: isValid,
                summary: summary,
              };
              const saved = await AiQuestion.create(questionData);
              return saved;
            }
            return null;
          } catch (err) {
            console.error(`Error processing individual question for topic "${topic}":`, err);
            return null;
          }
        };

        const processedResults = await Promise.all(questions.map(processQuestion));
        processedResults.forEach((saved) => {
          if (saved && savedQuestions.length < 30) {
            savedQuestions.push(saved);
          }
        });
      } catch (error) {
        console.error(`Error occurred in topic "${topic}":`);
        errorCount++;
      }
    }

    // Check the outcome after the loop
    if (savedQuestions.length >= 20) {
      console.log(`Topic "${topic}": Saved ${savedQuestions.length} valid questions in total.`);
      return NextResponse.json({ success: true, questions: savedQuestions });
    } else if (errorCount >= maxErrors) {
      return NextResponse.json(
        { error: "Failed to generate questions after multiple attempts" },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Could not generate enough valid questions within attempt limit" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}