import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { geminiSchema } from "../prompts";
import { sleep,
        getFileLines,
      
        detectMissingRanges,

        transformQuestions
      } from "../helper";

import { buildExtractionInstruction,buildPrompt,schemaDescription ,baseInstructions} from "../prompts";
// ============================
// Constants
// ============================
const CHUNK_SIZE = 300;        // Number of lines per chunk
const STEP_SIZE = 200;        // Reduced step size for more overlap
const MAX_RETRIES = 2;        // Increased retries for robustness
const INITIAL_SLEEP_MS = 30000; // Initial delay of 5 seconds
let TOTAL_CALLS=1;


async function processPromptWithWindowAdjustment(
  model: any,
  numberedLines: string[],
  currentIndex: number,
  processedNumbers: Set<number>,
  schemaDescription: string,
  baseInstructions: string,
  maxRetries: number,
  missingPrompt?:string,
): Promise<any[]> {
  let retries = 0;
  let end = Math.min(currentIndex + CHUNK_SIZE, numberedLines.length);
  let chunk = numberedLines.slice(currentIndex, end).join("\n");
  let extractionInstruction = buildExtractionInstruction(processedNumbers, chunk);
  let prompt='';
  if(missingPrompt){
    prompt = buildPrompt(schemaDescription, baseInstructions, missingPrompt);

  }else{
    prompt = buildPrompt(schemaDescription, baseInstructions, extractionInstruction);
  }

  while (retries < maxRetries) {
    try {
      console.log(`[Gemini] Processing chunk from line ${currentIndex + 1} to ${end}`);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const newQuestions = JSON.parse(responseText);
      console.log(newQuestions)
      console.log(`[Gemini] Extracted ${newQuestions.length} questions from this chunk`);
      console.log(TOTAL_CALLS++);
      return newQuestions;
    } catch (err) {
      retries++;
      const waitTime = INITIAL_SLEEP_MS * Math.pow(2, retries - 1); // Exponential backoff: 5s, 10s, 20s
      console.error(`[Gemini] Error on attempt ${retries}/${maxRetries}, retrying in ${waitTime / 1000}s:`, err);
      await sleep(waitTime);
      // Adjust window conservatively
      const newStart = Math.max(0, currentIndex - 100);
      const newEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE);
      chunk = numberedLines.slice(newStart, newEnd).join("\n");
      extractionInstruction = buildExtractionInstruction(processedNumbers, chunk);
      if(missingPrompt){
        prompt = buildPrompt(schemaDescription, baseInstructions, missingPrompt);
    
      }else{
        prompt = buildPrompt(schemaDescription, baseInstructions, extractionInstruction);
      }
      
    }
  }
  console.error(`[Gemini] Max retries (${maxRetries}) reached for chunk at line ${currentIndex + 1}`);
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
  const windowStart = Math.max(0, currentIndex - CHUNK_SIZE-200)
  const windowEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE);
  const windowChunk = numberedLines.slice(windowStart, windowEnd).join("\n");
  const missingNumbersText = missingRanges.map(r => `${r.from}-${r.to}`).join(", ");
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
  console.log("Request received, processing data");

  // Read file
  let originalLines: string[];
  let numberedLines: string[];

  try {
    const { fileId } = await request.json();
    ({ originalLines, numberedLines } = await getFileLines(fileId));
  } catch (err) {
    console.error("File reading error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  

  // Initialize containers
  let questions: any[] = [];
  let processedQuestionNumbers = new Set<number>();
  let processedQuestionObjects = new Set<string>(); // New set for question objects
  const EXPECTED_MAX_QUESTION = 90; // Set based on your input
  


  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
 
  
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }
 
  
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
    },
  });
 
  
  // Process file in chunks
  for (let i = 0; i < numberedLines.length; i += STEP_SIZE) {
    // console.log(`Processing chunk starting at line ${i + 1}`);
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
      // Serialize question object to check for duplicates
      const questionKey = JSON.stringify({
       
        question_content: q.question_content,
       
        
      });
      if (!processedQuestionObjects.has(questionKey)) {
        questions.push(q);
        processedQuestionNumbers.add(q.question_number);
        processedQuestionObjects.add(questionKey);
        // console.log(`Extracted question ${q.n}`); // Log for debugging
      } else {
        console.log(`Duplicate question ${q.n} detected, skipping.`);
      }
    }
    console.log("Processed question numbers:", [...processedQuestionNumbers]);

    // Handle missing questions
    const missingRanges = detectMissingRanges(processedQuestionNumbers);
    if (missingRanges.length > 0) {
      console.log(`Detected missing ranges: ${JSON.stringify(missingRanges)}`);
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
        const questionKey = JSON.stringify({
         
          question_content: q.question_content,
          
       
        });
        if (!processedQuestionObjects.has(questionKey)) {
          questions.push(q);
          processedQuestionNumbers.add(q.question_number);
          processedQuestionObjects.add(questionKey);
          // console.log(`Extracted missing question ${q.n}`);
        }
      }
      console.log("After missing window, processed question numbers:", [...processedQuestionNumbers]);
    }
  }

  // Transform and return
  const transformedQuestions = transformQuestions(questions, originalLines, EXPECTED_MAX_QUESTION);
  return NextResponse.json({
    questions: transformedQuestions,
    original_output:questions,
    processedQuestionNumbers: [...processedQuestionNumbers],
  });
}