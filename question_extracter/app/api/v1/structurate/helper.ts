import { readFile } from "fs/promises";
import { join } from "path";

// ============================
// Helper: Transform and filter questions
// ============================
/**
 * Transforms and filters extracted questions based on validation rules.
 * @param questions - Array of raw questions extracted from the Gemini model.
 * @param originalLines - Array of original file lines without numbering.
 * @param expectedMaxQuestion - The maximum expected question number (default: 90).
 * @returns An array of transformed and validated questions.
 */
export function transformQuestions(questions: any[], originalLines: string[], expectedMaxQuestion: number = 90): any[] {
  return questions
    .filter(q => {
      // Check if question number is within expected range
      if (q.question_number > expectedMaxQuestion) {
        console.log(`Question ${q.question_number} exceeds expected maximum (${expectedMaxQuestion}), skipping.`);
        return false;
      }
      // const content = getContent(q.question_content, originalLines, "question");
        // // Skip if content is empty or too short to be a question
        // if (!content.trim() || content.trim().length < 5) {
        //   console.log(`Question ${q.question_number} has invalid/empty content: "${content}", skipping.`);
        //   return false;
        // }
  
        // // Type-specific validation
        // if (q.question_type === 0) { // Multiple choice
        //   if (q.options.length === 0 || q.options.some((opt: any) => !getContent(opt.option_content, originalLines, "option").trim())) {
        //     console.log(`Question ${q.question_number} has invalid/empty options, skipping.`);
        //     return false;
        //   }
        // } else if (q.question_type === 1) { // Numerical
        //   const answer = getContent(q.solution.answer, originalLines, "solution");
        //   if (!answer.trim()) {
        //     console.log(`Question ${q.question_number} has no answer, skipping.`);
        //     return false;
        //   }answer
        // }

      return true;
    })
    .map(q => ({
      question_number: q.question_number,
      subject: sanitizeText(q.subject, "question"),
      content: getContent(q.question_content, originalLines, "question"),
      type: q.question_type === 0 ? "multiple_choice" : "numerical",
      options: q.options.map((opt: any) => ({
        option_id: opt.option_id,
        content: getContent(opt.option_content, originalLines, "option")
      })),
      solution: {
        answer: getContent(q.solution.answer, originalLines, "solution"),
        explanation: q.solution.explanation ? getContent(q.solution.explanation, originalLines, "solution") : undefined,
      },
      difficulty_level: q.difficulty_level,
    }));
}

// ============================
// Helper: Sanitize text based on type
// ============================
/**
 * Sanitizes text by removing unwanted prefixes based on its type.
 * @param text - The text to sanitize.
 * @param type - The type of text ("question", "option", or "solution").
 * @returns The sanitized text with prefixes removed.
 */
export function sanitizeText(text: string, type: "question" | "option" | "solution"): string {
  if (!text) return "";
  if (type === "question") {
    return text.replace(/^\d+\.\s*/, ""); // Removes leading number and dot (e.g., "2. ")
  } else if (type === "option") {
    return text.replace(/^\(\d+\)\s*/, ""); // Removes leading numbered option (e.g., "(1) ")
  } else if (type === "solution") {
    return text.replace(/^(sol\s?\.)/i, ""); // Removes "sol." or "Sol." prefix (case-insensitive)
  }
  return text;
}

// ============================
// Helper: Get and sanitize content from line specification
// ============================
/**
 * Retrieves and sanitizes content from original lines based on a line specification.
 * @param lineSpec - String specifying a single line or range (e.g., "3" or "3-5").
 * @param originalLines - Array of original file lines.
 * @param type - The type of content ("question", "option", or "solution", default: "question").
 * @returns The sanitized content extracted from the specified lines.
 */
export function getContent(lineSpec: string, originalLines: string[], type: "question" | "option" | "solution" = "question"): string {
  if (typeof lineSpec !== "string" || !lineSpec) {
    console.error("Invalid line specification:", lineSpec);
    return "";
  }
  let text = "";
  if (lineSpec.includes("-")) {
    const [startStr, endStr] = lineSpec.split("-");
    const start = parseInt(startStr, 10) - 1; // Convert to 0-based index
    const end = parseInt(endStr, 10);         // Inclusive end, 0-based
    if (isNaN(start) || isNaN(end) || start < 0 || end <= start || end > originalLines.length) {
      console.error("Invalid range:", lineSpec);
      return "";
    }
    text = originalLines.slice(start, end).join("\n"); // Extract range of lines
  } else {
    const lineNum = parseInt(lineSpec, 10) - 1; // Convert to 0-based index
    if (isNaN(lineNum) || lineNum < 0 || lineNum >= originalLines.length) {
      console.error("Invalid line number:", lineSpec);
      return "";
    }
    text = originalLines[lineNum]; // Extract single line
  }
  return sanitizeText(text, type); // Sanitize the extracted text
}

// ============================
// Helper: Sleep for a given number of milliseconds
// ============================
/**
 * Creates a promise that resolves after a specified delay.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// Helper: Read file and return original & numbered lines
// ============================
/**
 * Reads a file and returns both original and numbered lines.
 * @param fileId - The identifier of the file to read.
 * @returns A promise resolving to an object containing original and numbered lines.
 */
export async function getFileLines(fileId: string): Promise<{ originalLines: string[]; numberedLines: string[] }> {
  const filePath = join(process.cwd(), "/public/uploads", `${fileId}.md`); // Construct file path
  const fileContent = await readFile(filePath, "utf-8"); // Read file content
  const originalLines = fileContent.split("\n"); // Split into lines
  const numberedLines = originalLines.map((line, index) => `${index + 1}: ${line}`); // Add line numbers
  return { originalLines, numberedLines };
}

// ============================
// Helper: Detect missing question ranges
// ============================
/**
 * Detects ranges of missing question numbers from a set of processed numbers.
 * @param processedNumbers - A set of processed question numbers.
 * @returns An array of objects representing ranges of missing numbers.
 */
export function detectMissingRanges(processedNumbers: Set<number>): { from: number; to: number }[] {
  const sorted = Array.from(processedNumbers).sort((a, b) => a - b); // Sort numbers
  const missing: { from: number; to: number }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] > 1) {
      missing.push({ from: sorted[i] + 1, to: sorted[i + 1] - 1 }); // Identify gaps
    }
  }
  return missing;
}