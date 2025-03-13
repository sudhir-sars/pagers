import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { geminiSchema } from "../prompts";
import { sleep, getFileLines, detectMissingRanges, transformQuestions } from "../helper";
import { buildExtractionInstruction, buildPrompt, schemaDescription, baseInstructions } from "../prompts";

// ============================
// Constants
// ============================
// Constants controlling the chunking and retry behavior of the question extraction process.
const CHUNK_SIZE = 300;        // Number of lines to process in each chunk.
const STEP_SIZE = 200;         // Step size between chunks, smaller than CHUNK_SIZE to ensure overlap.
const MAX_RETRIES = 3;         // Maximum number of retry attempts for failed chunk processing.
const INITIAL_SLEEP_MS = 30000; // Initial delay (in milliseconds) before retrying after a failure.
let TOTAL_CALLS = 1;           // Counter for tracking total Gemini API calls.

// ============================
// Process a chunk of lines with retries and window adjustment
// ============================
/**
 * Processes a chunk of numbered lines using the Gemini model, with retry logic and window adjustment.
 * @param model - The Gemini model instance for content generation.
 * @param numberedLines - Array of file lines with numbered prefixes.
 * @param currentIndex - Starting index of the current chunk.
 * @param processedNumbers - Set of question numbers already processed.
 * @param schemaDescription - Description of the expected response schema.
 * @param baseInstructions - Base instructions for the prompt.
 * @param maxRetries - Maximum number of retries for failed attempts.
 * @param missingPrompt - Optional prompt for extracting missing questions.
 * @returns Promise resolving to an array of extracted questions.
 */
async function processPromptWithWindowAdjustment(
  model: any,
  numberedLines: string[],
  currentIndex: number,
  processedNumbers: Set<number>,
  schemaDescription: string,
  baseInstructions: string,
  maxRetries: number,
  missingPrompt?: string,
): Promise<any[]> {
  let retries = 0;
  let end = Math.min(currentIndex + CHUNK_SIZE, numberedLines.length); // End index of the chunk.
  let chunk = numberedLines.slice(currentIndex, end).join("\n"); // Extract and join lines into a chunk.
  let extractionInstruction = buildExtractionInstruction(processedNumbers, chunk); // Build instruction for extraction.
  let prompt = missingPrompt
    ? buildPrompt(schemaDescription, baseInstructions, missingPrompt)
    : buildPrompt(schemaDescription, baseInstructions, extractionInstruction); // Use missing prompt if provided.

  // Retry loop for handling failures with exponential backoff.
  while (retries < maxRetries) {
    try {
      console.log(`[Gemini] Processing chunk from line ${currentIndex + 1} to ${end}`);
      const result = await model.generateContent(prompt); // Generate content using the model.
      const responseText = result.response.text();
      const newQuestions = JSON.parse(responseText); // Parse the response into an array of questions.
      console.log(newQuestions); // Log the extracted questions for debugging.
      console.log(`[Gemini] Extracted ${newQuestions.length} questions from this chunk`);
      console.log(`Total Gemini API calls: ${TOTAL_CALLS++}`); // Increment and log total API calls.
      return newQuestions; // Return extracted questions on success.
    } catch (err) {
      retries++;
      const waitTime = INITIAL_SLEEP_MS * Math.pow(2, retries - 1); // Exponential backoff: 30s, 60s, etc.
      console.error(`[Gemini] Error on attempt ${retries}/${maxRetries}, retrying in ${waitTime / 1000}s:`, err);
      await sleep(waitTime); // Wait before retrying.
      // Adjust window to include more context for the next attempt.
      const newStart = Math.max(0, currentIndex - 100);
      const newEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE);
      chunk = numberedLines.slice(newStart, newEnd).join("\n");
      extractionInstruction = buildExtractionInstruction(processedNumbers, chunk);
      prompt = missingPrompt
        ? buildPrompt(schemaDescription, baseInstructions, missingPrompt)
        : buildPrompt(schemaDescription, baseInstructions, extractionInstruction);
    }
  }
  console.error(`[Gemini] Max retries (${maxRetries}) reached for chunk at line ${currentIndex + 1}`);
  return []; // Return empty array if all retries fail.
}

// ============================
// Process a window to extract missing questions
// ============================
/**
 * Processes a window of lines to extract questions from specified missing ranges.
 * @param model - The Gemini model instance.
 * @param schemaDescription - Description of the expected response schema.
 * @param baseInstructions - Base instructions for the prompt.
 * @param numberedLines - Array of file lines with numbered prefixes.
 * @param currentIndex - Current index for determining the window.
 * @param missingRanges - Array of ranges of missing question numbers.
 * @param maxRetries - Maximum number of retries for failed attempts.
 * @returns Promise resolving to an array of extracted missing questions.
 */
async function processMissingWindow(
  model: any,
  schemaDescription: string,
  baseInstructions: string,
  numberedLines: string[],
  currentIndex: number,
  missingRanges: { from: number; to: number }[],
  maxRetries: number
): Promise<any[]> {
  const windowStart = Math.max(0, currentIndex - CHUNK_SIZE - 200); // Start of the window, adjusted for more context.
  const windowEnd = Math.min(numberedLines.length, currentIndex + CHUNK_SIZE); // End of the window.
  const windowChunk = numberedLines.slice(windowStart, windowEnd).join("\n"); // Extract window chunk.
  const missingNumbersText = missingRanges.map(r => `${r.from}-${r.to}`).join(", "); // Format missing ranges.
  const missingPrompt = buildPrompt(
    schemaDescription,
    baseInstructions,
    `Extract missing questions (numbers ${missingNumbersText}) from the following text:\n\n${windowChunk}`
  ); // Build prompt for missing questions.
  return await processPromptWithWindowAdjustment(
    model,
    numberedLines,
    windowStart,
    new Set(), // Empty set since we're targeting missing questions.
    schemaDescription,
    baseInstructions,
    maxRetries,
    missingPrompt
  ); // Delegate to the adjustment function.
}

// ============================
// Main POST handler
// ============================
/**
 * Handles POST requests to process a file and extract questions using the Gemini model.
 * @param request - The incoming Next.js request object.
 * @returns Response with extracted questions, original output, and processed numbers.
 */
export async function POST(request: NextRequest) {
  console.log("Request received, processing data");

  // Read file
  let originalLines: string[];
  let numberedLines: string[];
  try {
    const { fileId } = await request.json(); // Extract fileId from request body.
    ({ originalLines, numberedLines } = await getFileLines(fileId)); // Get original and numbered lines.
  } catch (err) {
    console.error("File reading error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 }); // Return error if file not found.
  }
  
  // Initialize containers
  let questions: any[] = []; // Array to store extracted questions.
  let processedQuestionNumbers = new Set<number>(); // Set of processed question numbers.
  const EXPECTED_MAX_QUESTION = 90; // Maximum expected question number, set based on input.
  
  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 }); // Check for API key.
  }
  
  const genAI = new GoogleGenerativeAI(apiKey); // Initialize Google Generative AI with API key.
  const questionsSchema: ArraySchema = {
    description: "List of questions",
    type: SchemaType.ARRAY,
    items: geminiSchema, // Schema for individual questions.
  };
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro", // Specify the Gemini model version.
    generationConfig: {
      responseMimeType: "application/json", // Expect JSON response.
      responseSchema: questionsSchema, // Define the response schema.
    },
  });
  
  // Process file in chunks
  for (let i = 0; i < numberedLines.length; i += STEP_SIZE) {
    const newQuestions = await processPromptWithWindowAdjustment(
      model,
      numberedLines,
      i,
      processedQuestionNumbers,
      schemaDescription,
      baseInstructions,
      MAX_RETRIES
    ); // Process current chunk.
    
    // Add new questions and check for duplicates
    for (const q of newQuestions) {
      if (!processedQuestionNumbers.has(q.question_number)) {
        questions.push(q);
        processedQuestionNumbers.add(q.question_number); // Add question number to processed set.
      } else {
        console.log(`Duplicate question ${q.question_number} detected, skipping.`);
      }
    }
    console.log("Processed question numbers:", [...processedQuestionNumbers]);

    // Handle missing questions
    const missingRanges = detectMissingRanges(processedQuestionNumbers); // Detect gaps in question numbers.
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
      ); // Extract missing questions.
      for (const q of missingQuestions) {
        if (!processedQuestionNumbers.has(q.question_number)) {
          questions.push(q);
          processedQuestionNumbers.add(q.question_number);
        }
      }
      console.log("After missing window, processed question numbers:", [...processedQuestionNumbers]);
    }
  }
  
  // Transform and return results
  const transformedQuestions = transformQuestions(questions, originalLines, EXPECTED_MAX_QUESTION); // Transform questions.
  return NextResponse.json({
    questions: transformedQuestions, // Transformed questions for the response.
    original_output: questions, // Original extracted questions.
    processedQuestionNumbers: [...processedQuestionNumbers], // Array of processed question numbers.
  });
}