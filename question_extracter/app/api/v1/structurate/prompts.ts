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
- n (number, required: question number)
- s (string, required: infered question subject question number)
- c (string, required: line number in which question content is present)
- t (number, required: infered from question, 0 for "multiple_choice", 1 for Numberical question)
- o (options array of objects with oi (st  tags: q.ta || [],ring, required: option id), oc (string, required: option content ))
- so (object with sa (string, required: answer to the question), se (string, optional: explanation to the question))
- d (number, default 5: infered from question difficulty)

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

