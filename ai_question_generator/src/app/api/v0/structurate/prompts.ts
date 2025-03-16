import { ObjectSchema, SchemaType } from "@google/generative-ai";

export function buildPrompt(questionTopic: string): string {
  return `Generate 10 IIT JEE level multiple choice questions on ${questionTopic} (include formulas and graphical content where possible). 
Each question must be as challenging as the toughest past IIT JEE problems.
Ensure that:
- Analyze past JEE Mains question patterns, including conceptual depth, numerical complexity, and trickiness.
- The question should require similar problem-solving skills as real exam questions.
- Then, provide a step-by-step solution and a detailed explanation, mimicking how top JEE mentors explain it.
- Check the answer keys and answer and validate properly each question should have 4 options and correct answer.
- The question should be as difficult as the toughest JEE Mains questions from past years.
- It must include multi-step reasoning, require deeper conceptual understanding, and test problem-solving speed under exam conditions.
- Do not simplify the question unnecessarily. Provide a rigorous solution with insights on how to approach such problems in JEE Mains.
- The question content must not be more than 70 words.
- Each of the 4 options must not be more than 20 words.
- The detailed explanation must not be more than 170 words.
- Wait before answering and take time to self validate the question's integrity.
- Validate the answer keys so that the correct answer is among the provided options.
- Output the result in a structured JSON format following the provided schema.

Please output an array of question objects. Each question object must adhere to the following schema:

{
  "subject": String,                 // The subject area (e.g., "Physics").
  "question_content": String,        // The complete question text, not exceeding 60 words.
  "options": [                       // An array containing exactly 4 option objects.
    {
      "option_id": Number,           // The identifier for the option (1, 2, 3, or 4).
      "option_content": String       // The text of the option, not exceeding 20 words.
    }
    // ... exactly 4 options in total
  ],
  "solution": {                      // An object containing the correct answer and an optional explanation.
    "answer": String,                // The correct answer text, which must match one of the options.
    "explanation": String            // (Optional) Detailed explanation for the answer, not exceeding 170 words.
  },
  "difficulty_level": Number         // A numerical value representing the question's difficulty.
}

Ensure that:
- Only the fields specified above are present.
- The output is valid JSON and consists solely of an array of such question objects.`;
}

export const geminiSchema:ObjectSchema = {
  description: "Schema for a question model.",
  type: SchemaType.OBJECT,
  properties: {
    subject: {
      type: SchemaType.STRING,
      description:
        "The subject area of the question (e.g., Mathematics, Physics, Chemistry).",
      nullable: false,
    },
    question_content: {
      type: SchemaType.STRING,
      description: "The actual question content (max 60 words).",
      nullable: false,
    },
    options: {
      type: SchemaType.ARRAY,
      description:
        "Array of option objects for multiple choice questions (exactly 4 options expected).",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          option_id: {
            type: SchemaType.NUMBER,
            description: "The option id (e.g., 1, 2, 3, 4).",
            nullable: false,
          },
          option_content: {
            type: SchemaType.STRING,
            description: "The option content (max 20 words).",
            nullable: false,
          },
        },
        required: ["option_id", "option_content"],
      },
    },
    solution: {
      type: SchemaType.OBJECT,
      description:
        "An object containing the correct answer and an optional detailed explanation (max 170 words).",
      properties: {
        answer: {
          type: SchemaType.STRING,
          description:
            "The correct answer text (should match one of the options).",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "Optional detailed explanation for the answer.",
          nullable: false,
        },
      },
      required: ["answer", "explanation"],
    },
    difficulty_level: {
      type: SchemaType.NUMBER,
      description: "The inferred difficulty level of the question.",
      nullable: false,
    },
  },
  required: [
    "subject",
    "question_content",
    "options",
    "solution",
    "difficulty_level",
  ],
};

export const validatorSchema: ObjectSchema = {
  description: "Schema for rigorous question validation output.",
  type: SchemaType.OBJECT,
  properties: {
    isValid: {
      type: SchemaType.BOOLEAN,
      description: "Indicates whether the provided question object is logically correct and valid.",
      nullable: false,
    },
    summary:{
      type: SchemaType.STRING,
      description: "brief summary (approximately 20 words) describing the validation criteria you applied.",
      nullable: false,

    }

  },
  required: ["isValid","summary"],
};


export function buildValidatorPrompt(questionObject: string): string {
  return `
Please rigorously evaluate the following IIT JEE-level question object for logical integrity and correctness. Perform these comprehensive checks:

1. Verify that the "solution.answer" exactly matches one of the provided "option_content" values.
2. Ensure that the "solution.explanation" offers a clear, step-by-step justification that explains why the answer is correct and distinguishes it from the other options.
3. Check that the explanation is logically coherent and free from contradictions or ambiguous statements.
4. Evaluate the overall logical structure of the question. Confirm that the question content, options, answer, and explanation collectively form a valid and challenging problem.
5. If the question includes formulas or graphical content, verify that these are accurately referenced and logically integrated into the explanation.
6. Confirm that the question is designed to test multi-step reasoning and deep conceptual understanding typical of IIT JEE-level problems.
7. Ensure that no extraneous or incorrect reasoning is present that could undermine the integrity of the solution.

Also, include a brief summary (approximately 20 words) describing the validation criteria you applied.

Output your result as a JSON object in the following format:
{
  "isValid": boolean,
  "summary": string
}

Question object to validate:
${questionObject}\n\n
  `.trim();
}
