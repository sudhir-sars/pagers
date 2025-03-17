import { ObjectSchema, SchemaType } from "@google/generative-ai";

export function buildPrompt(questionTopic: string): string {
  return `
Generate 15 JEE Mains-level questions on ${questionTopic} with the exact difficulty level as past JEE Mains exams. Analyze past JEE Mains question patterns, including conceptual depth, numerical complexity, and trickiness. The question should require similar problem-solving skills as real exam questions. Then, provide a step-by-step solution and a detailed explanation, mimicking how top JEE mentors explain it. check the answer keys and answer and validate properly each question should have 4 options and correct answer

The question should be as difficult as the toughest JEE Mains questions from past years. It must include multi-step reasoning, require deeper conceptual understanding, and test problem-solving speed under exam conditions. Do not simplify the question unnecessarily. Provide a rigorous solution with insights on how to approach such problems in JEE Mains.

For each question, include:
- **"subject"**: String (e.g., "Mathematics", "Physics", "Chemistry").
- **"question_content"**: String (max 60 words, framing an exceptionally complex problem).
- **"options"**: Array of 4 objects, each with:
  - **"option_id"**: Number (1 to 4).
  - **"option_content"**: String (one must be the correct answer, all others being sophisticated distractors).
- **"solution"**: Object with:
  - **"answer"**: String (must match one 'option_content' exactly).
  - **"answer_id"**: String (answer_id will be the option_id of correct option that matches the answer).
  - **"explanation"**: String (explanation must be at max 150 words, providing a solution as delivered by top JEE mentors).
- **"difficulty_level"**: Number (0-100, reflecting extreme complexity).


**Output Format**:
Return a valid JSON array of 15 question objects, each adhering to the structure above.

**Example**:
{
  "subject": "Mathematics",
  "question_content": "Given f'(x) = f(x) + f(1-x) ∀ x ∈ ℝ, f(0) = 1, find f(x) if it exists.",
  "options": [
    {"option_id": 1, "option_content": "e^{x} + e^{1-x}"},
    {"option_id": 2, "option_content": "e^{x} - e^{1-x}"},
    {"option_id": 3, "option_content": "(e^{x} + e^{1-x}) / 2"},
    {"option_id": 4, "option_content": "(e^{x} - e^{1-x}) / 2"}
  ],
  "solution": {
    "answer": "(e^{x} + e^{1-x}) / 2",
    "answer_id":"3"
    "explanation": "Assume p(x) = f(x) + f(1-x), so p'(x) = f'(x) - f'(1-x) = 0, implying p(x) = K. Then f'(x) = K. But f(x) = Kx + C, and p(x) = 2C + K, leading to C = 0, f(0) = 0 ≠ 1, a contradiction. Reconsider symmetry and test options; option 3 fits conceptually despite initial condition mismatch."
  },
  "difficulty_level": 69
}
`;
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
            description: "The option content.",
            nullable: false,
          },
        },
        required: ["option_id", "option_content"],
      },
    },
    solution: {
      type: SchemaType.OBJECT,
      description: "An object containing the correct answer and explanation.",
      properties: {
        answer: {
          type: SchemaType.STRING,
          description: "The correct answer text, which must exactly match one of the options' option_content.",
          nullable: false,
        },
        answer_id:{
          type: SchemaType.STRING,
          description: "answer_id will be the option_id of correct option that matches the answer",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "concise explanation for the answer (max 150 words).",
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

export function buildFinalValidatorPrompt(questionObject: string): string {
  return `
Please perform a thorough and rigorous evaluation of the following IIT JEE-level question object for logical integrity, clarity, and scientific/mathematical correctness. Conduct the following checks:

1. Verify that the "solution.answer" exactly matches one of the provided "option_content" values.
2. Confirm that the explanation's reasoning is logically sound and that all mathematical or scientific steps are valid.
3. Ensure that the question statement is clearly formulated, precise, and free from ambiguities.
4. Check that any assumptions, approximations, or simplifications in the explanation are explicitly stated and properly justified.
5. Validate that the overall structure (question statement, options, answer, explanation, difficulty level, and summary) maintains strict internal consistency.
6. Confirm that the difficulty level and summary accurately reflect the content and correctness of the question and its solution.

Also, include a brief summary (approximately 20 words) describing the specific validation criteria applied.

Output your result as a JSON object in the following format:
{
  "isValid": boolean,
  "summary": string
}

Question object to validate:\n\n
${questionObject}\n\n
  `.trim();
}





export const fixerResponseSchema: ObjectSchema = {
  description: "Schema for corrected question and fix summary.",
  type: SchemaType.OBJECT,
  properties: {
    correctedQuestion: geminiSchema, // Assuming geminiSchema defines the question object structure
    fixSummary: {
      type: SchemaType.STRING,
      description: "A 25-word summary explaining how the question was fixed.",
      nullable: false,
    },
  },
  required: ["correctedQuestion", "fixSummary"],
};


export function buildFixerPrompt(invalidQuestion: any, validationSummary: string): string {
  const questionString = JSON.stringify(invalidQuestion, null, 2);
  return `
You are provided with an IIT JEE-level question object deemed invalid. Below is the question object and a validation summary explaining why it’s invalid. Correct the question object to make it logically correct and valid, adjusting the question content, options, solution answer, or explanation as needed. Ensure the corrected question follows the original schema and meets IIT JEE standards.

Additionally, provide a 25-word summary explaining how you fixed the question.

Original Question Object:
${questionString}

Validation Summary:
${validationSummary}

Return the corrected question and fix summary in this JSON format:
{
  "correctedQuestion": { /* corrected question object */ },
  "fixSummary": "A 25-word summary explaining the fix."
}
  `.trim();
}