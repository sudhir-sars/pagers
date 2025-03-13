export function buildExtractionInstruction(processedNumbers: Set<number>, chunk: string): string {
    if (processedNumbers.size > 0) {
      const lastQuestion = Math.max(...Array.from(processedNumbers));
      return `Extract questions from the following text, excluding questions with question numbers because these have been alredy extacrted: ${[...processedNumbers].join(", ")}, starting from question number ${lastQuestion + 1}:\n${chunk}`;
    }
    return `Extract all questions from the following text, where each line is prefixed with its line number:\n\n${chunk}`;
  }

export function buildPrompt(schemaDescription: string, baseInstructions: string, extractionInstruction: string): string {
    return `${schemaDescription}\n${baseInstructions}\n${extractionInstruction}`;
  }

  export const schemaDescription = `
Extract questions as a JSON array where each question is an object with:
- question_number (number, required)
- subject (string, required)
- content (string, required)
- image (string, optional)
- type (string, required, e.g., "multiple_choice")
- options (array of objects with option_id (string, required), content (string, optional), option_image (string, optional))
- solution (object with answer (string, required), explanation (string, optional), solution_image (string, optional))
- tags (array of strings, default empty)
- difficulty_level (number, default 5)

  `;

  export const baseInstructions = `
  Exclude page titles, headings, and subheadings, such as:
  - \\section*{FINAL JEE-MAIN EXAMINATION - APRIL, 2024}
  - (Held On Friday 05th April, 2024)
  - \\section*{MATHEMATICS}
  - \\section*{SECTION-A}
  
  
  NOTES:
  1. Never include options in question content or in the explanation.
  2. Never include answers in question or option content.
  3. Don’t include page header or footer.
  `;
