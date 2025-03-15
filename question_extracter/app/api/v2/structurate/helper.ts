import { readFile } from "fs/promises";
import { join } from "path";
import {
  buildPrompt,
  schemaDescription,
  baseInstructions,
  buildExtractionInstruction,
  geminiSchema,
  invaildFetchGeminiSchema,
  invalidFetchBaseInstructions,
  invalidFetchBuildExtractionInstruction,
  invalidFetchBuildPrompt,
  invalidFetchSchemaDescription,
} from "./prompts";
import { validateQuestionWithGroq } from "./groqValidator";
import {
  GoogleGenerativeAI,
  SchemaType,
  ArraySchema,
} from "@google/generative-ai";
import dbConnect from "@/lib/mongo";
import { QuestionModel } from "@/model/Question";
// Async mathpixValidator that uses fetch (make sure it's defined as below)
await dbConnect();
export async function mathpixValidator(inputText: string): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:3005/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputText }),
    });

    if (!response.ok) {
      console.error(
        "Error calling mathpix validator server:",
        response.statusText
      );
      return false;
    }

    const data = await response.json();
    if (data.valid == false) {
      console.log("false");
    }
    // Expecting a JSON response of the form { valid: true/false }
    return data.valid;
  } catch (error) {
    console.error("Error calling mathpix validator server");
    return false;
  }
}

function parseRange(lineSpec: string): { min: number; max: number } {
  if (lineSpec.includes("-")) {
    const [startStr, endStr] = lineSpec.split("-");
    return { min: parseInt(startStr, 10), max: parseInt(endStr, 10) };
  } else {
    const num = parseInt(lineSpec, 10);
    return { min: num, max: num };
  }
}

// Mark isQuestionValid as async and await the mathpixValidator calls.
export async function isQuestionValid(
  q: any,
  originalLines: string[]
): Promise<boolean> {
  const qContent = getContent(q.question_content, originalLines, "question");
  const validQuestion = await mathpixValidator(qContent);

  let validOptions = true;
  if (q.question_type === 0) {
    // Only check options for multiple choice
    // for (const opt of q.options) {
    //   const optContent = getContent(opt.option_content, originalLines, "option");
    //   if (!(await mathpixValidator(optContent))) {
    //     validOptions = false;
    //     break;
    //   }
    // }
    const allOptionsContent = q.options
      .map((opt) => getContent(opt.option_content, originalLines, "option"))
      .join(" ");

    if (!(await mathpixValidator(allOptionsContent))) {
      validOptions = false;
    }
  }

  const solAnswer = getContent(q.solution.answer, originalLines, "solution");
  const validSolAnswer = await mathpixValidator(solAnswer);

  const solExplanation = q.solution.explanation
    ? getContent(q.solution.explanation, originalLines, "solution")
    : "";
  const validSolExplanation = q.solution.explanation
    ? await mathpixValidator(solExplanation)
    : true;

  return validQuestion && validOptions && validSolAnswer && validSolExplanation;
}

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: invaildFetchGeminiSchema,
  },
});

let total_invalid_fetch_calle = 1;
async function fetchInvalidatedQuestions(
  prompt: string,
  dummymodel: any
): Promise<any> {
  const initialDelay = 25000; // 30 seconds in milliseconds
  // await sleep(initialDelay)
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    console.log("total_invalid_fetch_calle: ", total_invalid_fetch_calle++);
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const newQuestions = JSON.parse(responseText);
      // console.log("new feteched question is: ",newQuestions)
      return newQuestions;
    } catch (err) {
      retries++;
      if (retries >= maxRetries) {
        throw err;
      }
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.error(
        `Attempt ${retries} failed. Retrying in ${delay / 1000} seconds...`
      );
      await sleep(delay);
    }
  }
  // If for some reason the loop exits without returning, throw an error.
  throw new Error(
    "Failed to fetch invalidated questions after maximum retries"
  );
}

export async function transformQuestions(
  questions: any[],
  numberedLines: string[],
  originalLines: string[],
  expectedMaxQuestion: number = 90,
  questionRangeMap: Map<number, { min: number; max: number }>,
  model: any
): Promise<any[]> {
  const validatedQuestions: any[] = [];

  const filteredQuestions = questions.filter(
    (q) => q.question_number <= expectedMaxQuestion
  );
  const sortedQuestions = filteredQuestions
    .slice()
    .sort((a, b) => a.question_number - b.question_number);

  for (let q of sortedQuestions) {
    if (q.question_number > expectedMaxQuestion) continue;
    const qRange = parseRange(q.question_content);

    const solRange = q.solution.explanation
      ? parseRange(q.solution.explanation)
      : parseRange(q.solution.answer);
    // const overallRange = { min: qRange.min, max: solRange.max };
    const overallRange = {
      min: qRange?.min ?? 0,
      max: solRange?.max ?? 0,
    };

    q._overallRange = overallRange; // attach temporary property for overlap check
    // console.log(q);
    questionRangeMap.set(q.question_number, overallRange);
  }

  const overlappingGroups: Array<any[]> = [];
  let currentGroup: any[] = [];
  for (let i = 0; i < sortedQuestions.length; i++) {
    const q = sortedQuestions[i];
    if (currentGroup.length === 0) {
      currentGroup.push(q);
    } else {
      const lastInGroup = currentGroup[currentGroup.length - 1];
      if (q._overallRange.min < lastInGroup._overallRange.max) {
        console.log(q, lastInGroup);
        currentGroup.push(q);
      } else {
        if (currentGroup.length > 1) {
          overlappingGroups.push(currentGroup);
        }
        currentGroup = [q];
      }
    }
  }
  if (currentGroup.length > 1) {
    overlappingGroups.push(currentGroup);
  }

  const overlappingSet = new Set<number>();
  overlappingGroups.forEach((group) => {
    group.forEach((q) => overlappingSet.add(q.question_number));
  });

  for (const group of overlappingGroups) {
    const groupMin = Math.min(...group.map((q) => q._overallRange.min));
    const groupMax = Math.max(...group.map((q) => q._overallRange.max));
    const newMin = Math.max(0, groupMin - 100);
    const newMax = Math.min(numberedLines.length, groupMax + 100);
    const chunk = numberedLines.slice(newMin, newMax).join("\n");

    for (let q of group) {
      const extractionInstruction = `Extract question with question ${q.question_number} from the following text, where each line is prefixed with its line number:\n\n${chunk}`;
      const refetchPrompt = buildPrompt(
        invalidFetchSchemaDescription,
        invalidFetchBaseInstructions,
        `${extractionInstruction}\n\n${chunk}`
      );
      console.log("invalid fetch invocated by overlapper", group);

      const newDataArray = await fetchInvalidatedQuestions(
        refetchPrompt,
        model
      );
      console.log("\n\nsleep\n\n");
      await sleep(25000);
      const newQ = Array.isArray(newDataArray)
        ? newDataArray.find(
            (qq: any) => qq.question_number === q.question_number
          )
        : newDataArray;
      if (newQ && (await isQuestionValid(newQ, originalLines))) {
        q = newQ;
        console.log(
          `Question ${q.question_number} refetched sucessfully`,
          newQ
        );
      } else {
        console.log(
          `Question ${q.question_number} refetched but still invalid. Data:`,
          newQ
        );
        q._discard = true;
      }
    }
  }

  for (let q of sortedQuestions) {
    if (q._discard) continue;

    if (
      !overlappingSet.has(q.question_number) &&
      !(await isQuestionValid(q, originalLines))
    ) {
      console.log(
        `Validation failed for question ${q.question_number}. Attempting individual re-fetch...`
      );
      const overallRange = q._overallRange;
      const newMin = Math.max(0, overallRange.min - 100);
      const newMax = Math.min(numberedLines.length, overallRange.max + 100);
      const chunk = numberedLines.slice(newMin, newMax).join("\n");
      const extractionInstruction = `Extract question with question ${q.question_number} from the following text, where each line is prefixed with its line number:\n\n${chunk}`;
      const refetchPrompt = buildPrompt(
        invalidFetchSchemaDescription,
        invalidFetchBaseInstructions,
        `${extractionInstruction}}`
      );
      console.log(
        "invalid fetch invocated by mathpix for: ",
        q.question_number
      );
      const newDataArray = await fetchInvalidatedQuestions(
        refetchPrompt,
        model
      );

      await sleep(25000);
      console.log("\n\nsleep\n\n");

      const newQ = Array.isArray(newDataArray)
        ? newDataArray.find(
            (qq: any) => qq.question_number === q.question_number
          )
        : newDataArray;
      if (newQ && (await isQuestionValid(newQ, originalLines))) {
        q = newQ;
        console.log(
          `Question ${q.question_number} refetched sucessfully`,
          newQ
        );
      } else {
        console.log(
          `Question ${q.question_number} still fails validation after re-fetch. Discarding.`
        );
        continue;
      }
    }

    if (!(await isQuestionValid(q, originalLines))) {
      console.log(
        `Question ${q.question_number} fails validation. Discarding.`
      );
      continue;
    }

    // Build the final transformed question.
    const transformedQuestion = {
      question_number: q.question_number,
      subject: sanitizeText(q.subject, "question"),
      content: getContent(q.question_content, originalLines, "question"),
      type: q.question_type === 0 ? "multiple_choice" : "numerical",
      options:
        q.question_type === 0
          ? q.options.map((opt: any) => ({
              option_id: opt.option_id,
              content: getContent(opt.option_content, originalLines, "option"),
            }))
          : [],
      solution: {
        answer: getContent(q.solution.answer, originalLines, "solution"),
        explanation: q.solution.explanation
          ? getContent(q.solution.explanation, originalLines, "solution")
          : undefined,
      },
      difficulty_level: q.difficulty_level,
    };

    console.log("calling validaor");
    const validationResult = await validateQuestionWithGroq(
      transformedQuestion
    );
    // Create a new object that includes the validation field.
    const questionToSave = {
      ...transformedQuestion,
      validation: validationResult.isValid,
    };

    try {
      await QuestionModel.create(questionToSave);
      console.log(
        `Question ${transformedQuestion.question_number} saved to DB with validation: ${validationResult.isValid}`
      );
    } catch (error) {
      console.error(
        `Failed to save question ${transformedQuestion.question_number}:`,
        error
      );
    }
    await sleep(25000);
    if (validationResult.isValid) {
      validatedQuestions.push(transformedQuestion);
    } else {
      console.error(
        `Question ${q.question_number} failed Groq validation. Skipping push.`
      );
    }
  }

  return validatedQuestions;
}

export function sanitizeText(
  text: string,
  type: "question" | "option" | "solution"
): string {
  if (!text) return "";
  if (type === "question") {
    return text.replace(/^\d+\.\s*/, "");
  } else if (type === "option") {
    return text.replace(/^\(\d+\)\s*/, "");
  } else if (type === "solution") {
    return text.replace(/^(sol\s?\.)/i, "");
  }
  return text;
}

export function getContent(
  lineSpec: string,
  originalLines: string[],
  type: "question" | "option" | "solution" = "question"
): string {
  if (typeof lineSpec !== "string" || !lineSpec) {
    // console.error("Invalid line specification:");
    return "";
  }
  let text = "";
  if (lineSpec.includes("-")) {
    const [startStr, endStr] = lineSpec.split("-");
    const start = parseInt(startStr, 10) - 1;
    const end = parseInt(endStr, 10);
    if (
      isNaN(start) ||
      isNaN(end) ||
      start < 0 ||
      end <= start ||
      end > originalLines.length
    ) {
      // console.error("Invalid range:", lineSpec);
      return "";
    }
    text = originalLines.slice(start, end).join("\n");
  } else {
    const lineNum = parseInt(lineSpec, 10) - 1;
    if (isNaN(lineNum) || lineNum < 0 || lineNum >= originalLines.length) {
      // console.error("Invalid line number:");
      return "";
    }
    text = originalLines[lineNum];
  }
  return sanitizeText(text, type);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getFileLines(
  fileId: string
): Promise<{ originalLines: string[]; numberedLines: string[] }> {
  const filePath = join(process.cwd(), "/public/uploads", `${fileId}.md`);
  const fileContent = await readFile(filePath, "utf-8");
  const originalLines = fileContent.split("\n");
  const numberedLines = originalLines.map(
    (line, index) => `${index + 1}: ${line}`
  );
  return { originalLines, numberedLines };
}

export function detectMissingRanges(
  processedNumbers: Set<number>
): { from: number; to: number }[] {
  const sorted = Array.from(processedNumbers).sort((a, b) => a - b);
  const missing: { from: number; to: number }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] > 1) {
      missing.push({ from: sorted[i] + 1, to: sorted[i + 1] - 1 });
    }
  }
  return missing;
}
