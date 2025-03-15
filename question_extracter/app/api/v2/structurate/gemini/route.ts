import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  SchemaType,
  ArraySchema,
} from "@google/generative-ai";
import { geminiSchema } from "../prompts";
import {
  sleep,
  getFileLines,
  detectMissingRanges,
  transformQuestions,
} from "../helper";
import {
  buildExtractionInstruction,
  buildPrompt,
  schemaDescription,
  baseInstructions,
} from "../prompts";

const CHUNK_SIZE = 300;
const STEP_SIZE = 200;
const MAX_RETRIES = 3;
const INITIAL_SLEEP_MS = 30000;
let TOTAL_CALLS = 1;

async function processPromptWithWindowAdjustment(
  model: any,
  numberedLines: string[],
  currentIndex: number,
  processedNumbers: Set<number>,
  schemaDescription: string,
  baseInstructions: string,
  maxRetries: number,
  missingPrompt?: string
): Promise<any[]> {
  let retries = 0;
  let end = Math.min(currentIndex + CHUNK_SIZE, numberedLines.length);
  let chunk = numberedLines.slice(currentIndex, end).join("\n");
  let extractionInstruction = buildExtractionInstruction(
    processedNumbers,
    chunk
  );
  let prompt = missingPrompt
    ? buildPrompt(schemaDescription, baseInstructions, missingPrompt)
    : buildPrompt(schemaDescription, baseInstructions, extractionInstruction);
  while (retries < maxRetries) {
    try {
      console.log(
        `[Gemini] Processing chunk from line ${currentIndex + 1} to ${end}`
      );
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const newQuestions = JSON.parse(responseText);
      // console.log(newQuestions);
      console.log(
        `[Gemini] Extracted ${newQuestions.length} questions from this chunk`
      );
      console.log(`Total Gemini API calls: ${TOTAL_CALLS++}`);
      return newQuestions;
    } catch (err) {
      retries++;
      const waitTime = INITIAL_SLEEP_MS * Math.pow(2, retries - 1);
      console.error(
        `[Gemini] Error on attempt ${retries}/${maxRetries}, retrying in ${
          waitTime / 1000
        }s:`,
        err
      );
      await sleep(waitTime);
      const newStart = Math.max(0, currentIndex - 100);
      const newEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE);
      chunk = numberedLines.slice(newStart, newEnd).join("\n");
      extractionInstruction = buildExtractionInstruction(
        processedNumbers,
        chunk
      );
      prompt = missingPrompt
        ? buildPrompt(schemaDescription, baseInstructions, missingPrompt)
        : buildPrompt(
            schemaDescription,
            baseInstructions,
            extractionInstruction
          );
    }
  }
  console.error(
    `[Gemini] Max retries (${maxRetries}) reached for chunk at line ${
      currentIndex + 1
    }`
  );
  return [];
}

async function processMissingWindow(
  model: any,
  schemaDescription: string,
  baseInstructions: string,
  numberedLines: string[],
  currentIndex: number,
  missingRanges: { from: number; to: number }[],
  maxRetries: number
): Promise<any[]> {
  const windowStart = Math.max(0, currentIndex - CHUNK_SIZE - 200);
  const windowEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE);
  const windowChunk = numberedLines.slice(windowStart, windowEnd).join("\n");
  const missingNumbersText = missingRanges
    .map((r) => `${r.from}-${r.to}`)
    .join(", ");
  const missingPrompt = buildPrompt(
    schemaDescription,
    baseInstructions,
    `Extract missing questions (numbers ${missingNumbersText}) from the following text:\n\n${windowChunk}`
  );
  return await processPromptWithWindowAdjustment(
    model,
    numberedLines,
    windowStart,
    new Set(),
    schemaDescription,
    baseInstructions,
    maxRetries,
    missingPrompt
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("Request received, processing data");
    let originalLines: string[];
    let numberedLines: string[];
    const questionRangeMap: Map<number, { min: number; max: number }> =
      new Map();
    try {
      const { fileId } = await request.json();
      ({ originalLines, numberedLines } = await getFileLines(fileId));
    } catch (err) {
      console.error("File reading error:", err);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    let questions: any[] = [];
    let processedQuestionNumbers = new Set<number>();
    const EXPECTED_MAX_QUESTION = 90;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const questionsSchema: ArraySchema = {
      description: "List of questions",
      type: SchemaType.ARRAY,
      items: geminiSchema,
    };
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      // model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: questionsSchema,
      },
    });
    for (let i = 0; i < numberedLines.length; i += STEP_SIZE) {
      const newQuestions = await processPromptWithWindowAdjustment(
        model,
        numberedLines,
        i,
        processedQuestionNumbers,
        schemaDescription,
        baseInstructions,
        MAX_RETRIES
      );
      for (const q of newQuestions) {
        if (!processedQuestionNumbers.has(q.question_number)) {
          questions.push(q);
          processedQuestionNumbers.add(q.question_number);
        } else {
          console.log(
            `Duplicate question ${q.question_number} detected, skipping.`
          );
        }
      }
      console.log("Processed question numbers:", [...processedQuestionNumbers]);
      const missingRanges = detectMissingRanges(processedQuestionNumbers);
      if (missingRanges.length > 0) {
        console.log(
          `Detected missing ranges: ${JSON.stringify(missingRanges)}`
        );
        
        const missingQuestions = await processMissingWindow(
          model,
          schemaDescription,
          baseInstructions,
          numberedLines,
          i,
          missingRanges,
          MAX_RETRIES
        );
        for (const q of missingQuestions) {
          if (!processedQuestionNumbers.has(q.question_number)) {
            questions.push(q);
            processedQuestionNumbers.add(q.question_number);
          }
        }
        console.log("After missing window, processed question numbers:", [
          ...processedQuestionNumbers,
        ]);
      }
    }
    await sleep(30000)
    const transformedQuestions = await transformQuestions(
      questions,
      numberedLines,
      originalLines,
      EXPECTED_MAX_QUESTION,
      questionRangeMap,
      model
    );
    // console.log(transformedQuestions)
    return NextResponse.json({
      questions: transformedQuestions,
      original_output: questions,
      processedQuestionNumbers: [...processedQuestionNumbers],
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
