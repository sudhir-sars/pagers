
import { ObjectSchema, SchemaType } from "@google/generative-ai";

export function buildExtractionInstruction(processedNumbers: Set<number>, chunk: string): string {
    if (processedNumbers.size > 0) {
      const lastQuestion = Math.max(...Array.from(processedNumbers));
      return `Extract questions from the following text, where each line is prefixed with its line number.\n\n Exclude questions with question numbers : ${[...processedNumbers].join(", ")} as these have been already extracted.\n\n,Extract questions starting from question number ${lastQuestion + 1} from text:\n\n${chunk}`;
    }
    return `Extract all questions from the following text, where each line is prefixed with its line number:\n\n${chunk}`;
  }

export function buildPrompt(schemaDescription: string, baseInstructions: string, extractionInstruction: string): string {
    return `${schemaDescription}\n${baseInstructions}\n${extractionInstruction}`;
  }

  export const schemaDescription = `
  Extract questions as a JSON array where each question object includes:
  - question_number (number, required): The question number of the identified question.
  - subject (string, required): The question's subject (e.g., Mathematics, Physics, Chemistry).
  - question_content (string, required): The line number or range containing the question text (e.g., '3' or '3-5').
  - question_type (number, required): The question type: 0 for multiple choice, 1 for numerical answer. Only 0 or 1 is allowed.
  - options (array, required): For multiple choice questions, an array of option objects with:
    - option_id (number, required): The option index (starting at 0).
    - option_content (string, required): The line number or range containing the option text (e.g., '6' or '6-7').
  - solution (object, required): Contains:
    - answer (string, required): The line number or range indicating the correct answer (e.g., '8' or '8-9').
    - explanation (string, optional): Optional: The line number or range for the answer explanation (e.g., '10' or '10-12')..
  - difficulty_level (number, required): The inferred difficulty level of the question in rahe 1-10 with 1 being easiest.
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
              description: "The option id of thr option",
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
  

