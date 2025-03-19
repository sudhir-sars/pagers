import { ObjectSchema, SchemaType } from "@google/generative-ai";

export function buildPrompt(subject: string, questionTopic: string): string {
  let prompt = "";

  switch (subject.toLowerCase()) {
    case "chemistry_organic":
      prompt = `
        Generate 10 JEE Mains-level questions on ${questionTopic} with the exact difficulty level as past JEE Mains exams. Analyze past JEE Mains question patterns, including conceptual depth, numerical complexity, and trickiness. The question should require similar problem-solving skills as real exam questions. Then, provide a step-by-step solution and a detailed explanation, mimicking how top JEE mentors explain it. check the answer keys and answer and validate properly each question should have 4 options and correct answer.
        The question should be as difficult as the toughest JEE Mains questions from past years. It must include multi-step reasoning, require deeper conceptual understanding, and test problem-solving speed under exam conditions. Do not simplify the question unnecessarily. Provide a rigorous solution with insights on how to approach such problems in JEE Mains.
        **Mathpix Markdown Syntax Reference for Chemistry:**
        - **Chemical Structures:**
          - Inline: \`<smiles>SMILES_STRING</smiles>\` (e.g., \`<smiles>c1ccccc1</smiles>\` renders as benzene).
          - Block mode: \`\\begin{smiles} SMILES_STRING \\end{smiles}\` (e.g., \`\\begin{smiles} CCO \\end{smiles}\` renders as ethanol).
        - **Mathematical Expressions:**
          - Inline: \`\\( ... \\)\` (e.g., \`\\( \\Delta H = -285.8 \\, \\text{kJ/mol} \\)\`).
          - Block mode: \`\\[ ... \\]\` (e.g., \`\\[ K = \\frac{[\\ce{CO2}]}{[\\ce{CO}]} \\]\`).

        **Formatting Requirements:**
        - Use SMILES notation with the specified tags for all chemical structures; do NOT use plain chemical names (e.g., "benzene") or unformatted formulas.
        - Ensure SMILES strings are valid and complete (e.g., \`<smiles>CCO</smiles>\` for CH₃CH₂OH).
        - For mathematical expressions, use the Mathpix Markdown syntax as shown above.
        - Proofread all content for spelling and grammar errors, especially chemical terms.
        - **Important Note:** Strictly adhere to the syntax reference. All chemical structures must use SMILES tags, and all mathematical expressions must be in \`\\( ... \\)\` or \`\\[ ... \\]\`.

        **Output Format:**
        Return a valid JSON array of 10 question objects, each with "subject", "question_content", "options", "solution", and "difficulty_level".

        **Example (showing one question for brevity):**
        [
          {
            "subject": "Chemistry",
            "question_content": "What is the IUPAC name of <smiles>CCO</smiles>?",
            "options": [
              {"option_id": 1, "option_content": "Methanol"},
              {"option_id": 2, "option_content": "Ethanol"},
              {"option_id": 3, "option_content": "Propanol"},
              {"option_id": 4, "option_content": "Butanol"}
            ],
            "solution": {
              "answer": "Ethanol",
              "answer_id": "2",
              "explanation": "The  <smiles>CCO</smiles> represents CH₃CH₂OH, which is ethanol."
            },
            "difficulty_level": 50
          }
        ]
        `;
        break;


        case "chemistry_inorganic":
          prompt = `
        Generate 5 JEE Mains-level questions on ${questionTopic} with the exact difficulty level as past JEE Mains exams. Analyze past JEE Mains question patterns—including conceptual depth, numerical complexity, and trickiness—and create problems requiring multi-step reasoning, deeper conceptual understanding, and quick problem-solving. Provide each question with 4 options, a verified correct answer, and a step-by-step solution that explains the approach in detail, as top JEE mentors would.
        
        The question difficulty should match the toughest JEE Mains questions from past years without oversimplification.
       
        **Instructions:**
              1. **Step-by-Step Explanation:** First, generate a brief explanation of the approach (in LaTeX) that outlines how to solve the problem. This explanation must **not exceed 150 words** and **must not include the final answer**.
              2. **Final Answer:** Next, determine the final answer. Ensure it exactly matches one of the options.
              3. **Options Generation:** Then, produce 4 options (each option must be within 100 words), one of which is the correct answer.
              4. **Final Detailed Explanation:** Finally, provide a detailed explanation (in LaTeX) that validates the correct answer. This final explanation must also be **within 150 words**.
              
              **Strict Rules for Solution and Explanation Requirements:**
              - The solution explanation **must strictly not exceed 150 words**.
              - Ensure the final answer matches one of the options.

        **Output Format:**
        Return a valid JSON array of 5 question objects, each with:
        - "subject"
        - "question_content"
        - "options"
        - "solution"
        - "difficulty_level"
          **Final Reminders:**
        - The detailed explanation in the solution must **strictly not exceed 150 words**.
        - Each \`option_content\` must **strictly not exceed 100 words**.
        

       
        `;
      break;
        
      case "physics":

        prompt = `
        Generate 5 JEE Mains-level questions on ${questionTopic} that match the exact difficulty level of past JEE Mains exams. Analyze past exam patterns—including conceptual depth, numerical complexity, and trickiness—to design questions that require real exam problem-solving skills. Each question must include 4 options with exactly one correct answer. Validate each answer key and ensure complete consistency.
        
        The questions should be as challenging as the toughest past JEE Mains problems, requiring multi-step reasoning and deep conceptual understanding under exam conditions. Do not simplify the questions unnecessarily. Provide a rigorous, step-by-step solution along with a detailed explanation mimicking the style of top JEE mentors.
       
         **Instructions:**
        1. **Step-by-Step Explanation:** First, generate a brief explanation of the approach (in LaTeX) that outlines how to solve the problem. This explanation must **not exceed 150 words** and **must not include the final answer**.
        2. **Final Answer:** Next, determine the final answer. Ensure it exactly matches one of the options.
        3. **Options Generation:** Then, produce 4 options (each option must be within 100 words), one of which is the correct answer.
        4. **Final Detailed Explanation:** Finally, provide a detailed explanation (in LaTeX) that validates the correct answer. This final explanation must also be **within 150 words**.
        
        **Strict Rules for Solution and Explanation Requirements:**
        - The solution explanation **must strictly not exceed 150 words**.
        - Ensure the final answer matches one of the options.
        
        **Output Format:**
        Return a valid JSON array of 5 question objects. Each object must include:
        - \`subject\`
        - \`question_content\`
        - \`options\` (an array of objects with \`option_id\` and \`option_content\`)
        - \`solution\` (an object with \`answer\`, \`answer_id\`, and \`explanation\`)
        - \`difficulty_level\`
       
        
        **Final Reminders:**
        - The detailed explanation in the solution must **strictly not exceed 150 words**.
        - Each \`option_content\` must **strictly not exceed 100 words**.
        `;
        
        break;
        case "mathematics":
          prompt = `
        Generate 5 JEE Mains-level questions on ${questionTopic} with the exact difficulty level as past JEE Mains exams. Analyze past JEE Mains question patterns, including conceptual depth, numerical complexity, and trickiness. The question should require similar problem-solving skills as real exam questions. Then, provide a step-by-step solution and a detailed explanation, mimicking how top JEE mentors explain it. Check the answer keys and validate properly. Each question should have 4 options and a correct answer.
        
        The question should be as difficult as the toughest JEE Mains questions from past years. It must include multi-step reasoning, require deeper conceptual understanding, and test problem-solving speed under exam conditions. Do not simplify the question unnecessarily. Provide a rigorous solution with insights on how to approach such problems in JEE Mains.
        
        
        **Instructions:**
        1. **Step-by-Step Explanation:** First, generate a brief explanation of the approach (in LaTeX) that outlines how to solve the problem. This explanation must **not exceed 150 words** and **must not include the final answer**.
        2. **Final Answer:** Next, determine the final answer. Ensure it exactly matches one of the options.
        3. **Options Generation:** Then, produce 4 options (each option must be within 100 words), one of which is the correct answer.
        4. **Final Detailed Explanation:** Finally, provide a detailed explanation (in LaTeX) that validates the correct answer. This final explanation must also be **within 150 words**.
        
        **Strict Rules for Solution and Explanation Requirements:**
        - The solution explanation **must strictly not exceed 150 words**.
        - Ensure the final answer matches one of the options.
        
        **Output Format:**
        Return a valid JSON array of 5 question objects. Each object must include:
        - \`subject\`
        - \`question_content\`
        - \`options\` (an array of objects with \`option_id\` and \`option_content\`)
        - \`solution\` (an object with \`answer\`, \`answer_id\`, and \`explanation\`)
        - \`difficulty_level\`
       
        
        **Final Reminders:**
        - The detailed explanation in the solution must **strictly not exceed 150 words**.
        - Each \`option_content\` must **strictly not exceed 100 words**.
        `;
          break;
        
    default:
      throw new Error("Invalid subject specified. Use 'chemistry', 'physics', or 'mathematics'.");
  }

  return prompt;
}

export const geminiSchema: ObjectSchema = {
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
            description: "The option content not exceeding 100 words.",
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
        answer_id: {
          type: SchemaType.STRING,
          description: "answer_id will be the option_id of the correct option that matches the answer",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "Concise explanation for the answer (not exceeding 150 words).",
          nullable: false,
        },
      },
      required: ["answer", "explanation", "answer_id"],
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
    summary: {
      type: SchemaType.STRING,
      description: "Brief summary (approximately 20 words) describing the validation criteria you applied.",
      nullable: false,
    }
  },
  required: ["isValid", "summary"],
};

export function buildValidatorPrompt(questionObject: string): string {
  return `
Please rigorously evaluate the following IIT JEE-level question object for logical integrity and correctness. Perform these comprehensive checks:

1. Verify that the "answer" and "answer_id" in solution object exactly matches one of the provided "option_content" and "option_id" values.
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

1. Verify that the "answer" and "answer_id" in solution object exactly matches one of the provided "option_content" and "option_id" values.
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
    correctedQuestion: geminiSchema,
    fixSummary: {
      type: SchemaType.STRING,
      description: "A 25-word summary explaining how the question was fixed.",
      nullable: false,
    },
  },
  required: ["correctedQuestion", "fixSummary"],
};

export function buildFixerPrompt(invalidQuestion: any, validationSummary: string, subject: string): string {
  const questionString = JSON.stringify(invalidQuestion, null, 2);
  if (subject === "chemistry_inorganic") {
    return `
You are provided with an IIT JEE-level inorganic chemistry question object that is deemed invalid. The question object may have logical errors and Mathpix Markdown formatting issues, such as improper inline math delimiters, incorrect chemical notation for ionic species, faulty block math expressions, or misformatted SMILES.

Please fix the following aspects:
1. Correct any logical errors in the question content, options, solution answer, or explanation.
2. Strictly enforce the Mathpix Markdown Syntax Reference (Inorganic & Ionic):
   - All ionic species must be formatted with '\\(\\ce{...}\\)'. For example, use '\\(\\ce{H3O+}\\)' instead of plain text.
   - Inline math expressions must use '\\( ... \\)' delimiters.
   - Block math expressions must use '\\[ ... \\]' (or valid LaTeX environments).
   - For complex inorganic structures, use '<smiles> ... </smiles>' if a valid SMILES exists; otherwise, default to '\\(\\ce{...}\\)'.
   - Remove any extra spaces, misused escape characters, or raw error messages.
3. Ensure the final output fully complies with the Mathpix Markdown Syntax Reference below:
   
   **Mathpix Markdown Syntax Reference (Inorganic & Ionic):**
   1. **Ions and Equilibrium Constants**
      - For ionic species, always use inline Mathpix with '\\(\\ce{...}\\)'.
      - Example: '\\(\\ce{H3O+}\\)', '\\(\\ce{OH-}\\)', '\\(\\ce{Ag+}\\)', '\\(K_w\\)', '\\(K_{sp}\\)', etc.
      - Correct usage for water’s ion product: '\\(K_w = \\ce{H3O+} \\cdot \\ce{OH-}\\)'.
      - Correct usage for solubility product: '\\(K_{sp} = \\ce{Ag+} \\cdot \\ce{Cl-}\\)'.
      - Do not leave ionic species in plain text.
   2. **Complex Inorganic Structures**
      - Use '<smiles> ... </smiles>' for valid SMILES; otherwise, use '\\(\\ce{...}\\)'.
   3. **Mathematical Expressions**
      - Inline: '\\( ... \\)' (e.g., '\\(\\Delta G = -RT \\ln K\\)').
      - Block mode: '\\[ ... \\]' (e.g., '\\[K = \\frac{\\ce{CO2}}{\\ce{CO}}\\]').
4. Ensure that the corrected question object adheres to the original schema and meets IIT JEE standards.

Additionally, provide a 25-word summary explaining the fixes made.

Original Question Object:
${questionString}

Validation Summary:
${validationSummary}

Return the corrected question and fix summary in the following JSON format:
{
  "correctedQuestion": { /* corrected question object */ },
  "fixSummary": "A 25-word summary explaining the fix."
}
    `.trim();
  } else {
    return `
You are provided with an IIT JEE-level question object deemed invalid. Below is the question object and a validation summary explaining why it’s invalid. Correct the question object to make it logically correct and valid—adjust the question content, options, solution answer, or explanation as needed. Ensure the corrected question follows the original schema and meets IIT JEE standards.

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
}

