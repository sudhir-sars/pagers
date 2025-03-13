import { readFile } from "fs/promises";
import { join } from "path";

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

export function sanitizeText(text: string, type: "question" | "option" | "solution"): string {
    if (!text) return "";
    if (type === "question") {
      return text.replace(/^\d+\.\s*/, ""); // e.g., "2. "
    } else if (type === "option") {
      return text.replace(/^\(\d+\)\s*/, ""); // e.g., "(1) "
    }
    else if (type === "solution") {
      return text.replace(/^(sol\s?\.)/i, '');
    }
    return text;
  }

export function getContent(lineSpec: string, originalLines: string[], type: "question" | "option" | "solution" = "question"): string {
    if (typeof lineSpec !== "string" || !lineSpec) {
      console.error("Invalid line specification:", lineSpec);
      return "";
    }
    let text = "";
    if (lineSpec.includes("-")) {
      const [startStr, endStr] = lineSpec.split("-");
      const start = parseInt(startStr, 10) - 1; // 0-based index
      const end = parseInt(endStr, 10);         // Inclusive end, 0-based
      if (isNaN(start) || isNaN(end) || start < 0 || end <= start || end > originalLines.length) {
        console.error("Invalid range:", lineSpec);
        return "";
      }
      text = originalLines.slice(start, end).join("\n");
    } else {
      const lineNum = parseInt(lineSpec, 10) - 1; // 0-based index
      if (isNaN(lineNum) || lineNum < 0 || lineNum >= originalLines.length) {
        console.error("Invalid line number:", lineSpec);
        return "";
      }
      text = originalLines[lineNum];
    }
    return sanitizeText(text, type);
  }

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export async function getFileLines(fileId: string): Promise<{ originalLines: string[]; numberedLines: string[] }> {

  const filePath = join(process.cwd(), "/public/uploads", `${fileId}.md`);
    const fileContent = await readFile(filePath, "utf-8");
    const originalLines = fileContent.split("\n");
    const numberedLines = originalLines.map((line, index) => `${index + 1}: ${line}`);
    return { originalLines, numberedLines };
  }



export function detectMissingRanges(processedNumbers: Set<number>): { from: number; to: number }[] {
    const sorted = Array.from(processedNumbers).sort((a, b) => a - b);
    const missing: { from: number; to: number }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] > 1) {
        missing.push({ from: sorted[i] + 1, to: sorted[i + 1] - 1 });
      }
    }
    return missing;
  }




