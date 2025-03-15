import { ObjectSchema, SchemaType } from "@google/generative-ai";

export function buildExtractionInstruction(processedNumbers: Set<number>, chunk: string): string {
  if (processedNumbers.size > 0) {
    const lastQuestion = Math.max(...Array.from(processedNumbers));
    return `Extract questions from the following text, where each line is prefixed with its line number.
    
      Exclude questions with question numbers: ${[...processedNumbers].join(", ")} as these have already been extracted.
      Extract questions starting from question number ${lastQuestion + 1}.

      IMPORTANT:
      - There are only 90 questions in the document.
      - Do not extract data for already processed questions.
      - Only use the given question numbers from the markdown. Do not generate any new or random question numbers.

      Text:\n\n
      ${chunk}`;
        }
  return `Extract all questions from the following text, where each line is prefixed with its line number:\n\n${chunk}`;
}

export function buildPrompt(schemaDescription: string, baseInstructions: string, extractionInstruction: string): string {
  return `${schemaDescription}\n\n${baseInstructions}\n\n${extractionInstruction}`;
}

export const schemaDescription = `
  Extract questions as a JSON objects array where each question object includes:
  - question_number (number, required): The question number of the identified question.
  - subject (string, required): The question's subject (e.g., Mathematics, Physics, Chemistry).
  - question_content (string, required): The line number or range containing the question text (e.g., '3' or '3-5').
  - question_type (number, required): The question type: 0 for multiple choice, 1 for numerical answer. Only 0 or 1 is allowed.
  - options (array, required): For multiple choice questions, an array of option objects with:
    - option_id (number, required): The option index (starting at 1 ).
    - option_content (string, required): The line number or range containing the option text (e.g., '6' or '6-7').
  - solution (object, required): Contains:
    - answer (string, required): The line number or range indicating the correct answer (e.g., '8' or '8-9').
    - explanation (string, optional): Optional: The line number or range for the answer explanation (e.g., '10' or '10-12')..
  - difficulty_level (number, required): The inferred difficulty level of the question in rahe 1- with 1 being easiest and 5 being hard.
  \n\n`;

export const baseInstructions = `
  Exclude page titles, headings, water marks and subheadings, such as:
  - \section*{FINAL JEE-MAIN EXAMINATION - APRIL, 2024}
  - \section*{FINAL NEET EXAMINATION - APRIL, 2024}
  - (Held On Friday 05th April, 2024)
  - \section*{SECTION}
  - \section*{MATHEMATICS}
  - \section*{SECTION-A}
  
  NOTES:
  1. Never include options in question content or in the explanation.
  2. Never include answers in question or option content.
  3. Don’t include page header or footer.
  4. Never include lines number of other questions question_content or explanation in the current question.
  5. No field should contain data from any other question past or upcoming. For instance, if the current question number is 5, there must be no references to question 4 or 6, etc.
  \n\n`;

export const geminiSchema: ObjectSchema = {
  description: "Schema for a question model.",
  type: SchemaType.OBJECT,
  properties: {
    question_number: {
      type: SchemaType.NUMBER,
      description: "The  question number of the identified question.",
      nullable: false,
    },
    subject: {
      type: SchemaType.STRING,
      description: "The subject area of the question (e.g., Mathematics, Physics, Chemistry).",
      nullable: false,
    },
    question_content: {
      type: SchemaType.STRING,
      description: "The line number or range containing the question text (e.g., '3' or '3-5').",
      nullable: false,
    },
    question_type: {
      type: SchemaType.NUMBER,
      description: "The question type: 0 for multiple choice, 1 for numerical answer. Only 0 or 1 is allowed.",
      nullable: false,
    },
    options: {
      type: SchemaType.ARRAY,
      description: "Array of option objects for multiple choice questions. For numerical questions, leave empty.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          option_id: {
            type: SchemaType.NUMBER,
            description: "The option id of the option like 1, 2, 3, 4",
            nullable: false,
          },
          option_content: {
            type: SchemaType.STRING,
            description: "The line number or range containing the option text (e.g., '6' or '6-7').",
            nullable: false,
          },
        },
        required: ["option_id", "option_content"],
      },
    },
    solution: {
      type: SchemaType.OBJECT,
      description: "An object containing the correct answer and an optional explanation.",
      properties: {
        answer: {
          type: SchemaType.STRING,
          description: "The line number or range indicating the correct answer (e.g., '8' or '8-9').",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "Optional: The line number or range for the answer explanation (e.g., '10' or '10-12').",
          nullable: true,
        },
      },
      required: ["answer"],
    },
    difficulty_level: {
      type: SchemaType.NUMBER,
      description: "The inferred difficulty level of the question.",
      nullable: false,
    },
  },
  required: [
    "question_number",
    "subject",
    "question_content",
    "question_type",
    "options",
    "solution",
    "difficulty_level",
  ],
};



export const invaildFetchGeminiSchema: ObjectSchema = {
  description: "Schema for a single question model where content fields represent line numbers or ranges from the source text.",
  type: SchemaType.OBJECT,
  properties: {
    question_number: {
      type: SchemaType.NUMBER,
      description: "The question number as identified in the source text.",
      nullable: false,
    },
    subject: {
      type: SchemaType.STRING,
      description: "The subject area of the question (e.g., Mathematics, Physics, Chemistry).",
      nullable: false,
    },
    question_content: {
      type: SchemaType.STRING,
      description: "The line number or range (e.g., '3' or '3-5') where the question text is located.",
      nullable: false,
    },
    question_type: {
      type: SchemaType.NUMBER,
      description: "The question type: 0 for multiple choice, 1 for numerical answer. Only 0 or 1 is allowed.",
      nullable: false,
    },
    options: {
      type: SchemaType.ARRAY,
      description: "For multiple choice questions, an array of option objects where each option_content is a line number or range (e.g., '6' or '6-7'). For numerical questions, this array should be empty.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          option_id: {
            type: SchemaType.NUMBER,
            description: "The option index (starting at 1).",
            nullable: false,
          },
          option_content: {
            type: SchemaType.STRING,
            description: "The line number or range where the option text is located.",
            nullable: false,
          },
        },
        required: ["option_id", "option_content"],
      },
    },
    solution: {
      type: SchemaType.OBJECT,
      description: "An object containing the correct answer and an optional explanation, both represented as line numbers or ranges from the source text.",
      properties: {
        answer: {
          type: SchemaType.STRING,
          description: "The line number or range where the correct answer is located (e.g., '8' or '8-9').",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "Optional: The line number or range where the explanation is located (e.g., '10' or '10-12').",
          nullable: true,
        },
      },
      required: ["answer"],
    },
    difficulty_level: {
      type: SchemaType.NUMBER,
      description: "The inferred difficulty level of the question (e.g., 1 to 5).",
      nullable: false,
    },
  },
  required: [
    "question_number",
    "subject",
    "question_content",
    "question_type",
    "options",
    "solution",
    "difficulty_level",
  ],
};

export const invalidFetchSchemaDescription = `
Extract a question as a JSON object with the following properties:
- question_number (number, required): The question number from the source text.
- subject (string, required): The subject of the question.
- question_content (string, required): The line number or range where the question text is found (e.g., '3' or '3-5').
- question_type (number, required): 0 for multiple choice, 1 for numerical answer.
- options (array, required): For multiple choice questions, an array of option objects with:
  - option_id (number, required): The option index (starting at 1).
  - option_content (string, required): The line number or range where the option text is found (e.g., '6' or '6-7').
- solution (object, required): Contains:
  - answer (string, required): The line number or range where the correct answer is found (e.g., '8' or '8-9').
  - explanation (string, optional): The line number or range for the explanation (e.g., '10' or '10-12').
- difficulty_level (number, required): The difficulty level of the question.
`;

export const invalidFetchBaseInstructions = `
Exclude page titles, headings, watermarks, and subheadings such as:
- \\section*{FINAL JEE-MAIN EXAMINATION - APRIL, 2024}
- \\section*{FINAL NEET EXAMINATION - APRIL, 2024}
- (Held On Friday 05th April, 2024)
- \\section*{SECTION}
- \\section*{MATHEMATICS}
- \\section*{SECTION-A}

NOTES:
1. Do not include any option details in the question_content or in the explanation.
2. Do not include the answer within the question_content or option_content.
3. Do not include line numbers or content from other questions.
`;

export function invalidFetchBuildExtractionInstruction(processedNumbers: Set<number>, chunk: string): string {
  if (processedNumbers.size > 0) {
    const lastQuestion = Math.max(...Array.from(processedNumbers));
    return `Extract the question as a JSON object from the following text (each line is prefixed with its line number).
    
Exclude questions with question numbers: ${[...processedNumbers].join(", ")}.
    
Extract the question starting from question number ${lastQuestion + 1}:
    
${chunk}`;
  }
  return `Extract the question as a JSON object from the following text (each line is prefixed with its line number):
    
${chunk}`;
}

export function invalidFetchBuildPrompt(schemaDescription: string, baseInstructions: string, extractionInstruction: string): string {
  return `${schemaDescription}\n\n${baseInstructions}\n\n${extractionInstruction}`;
}


