import Groq from "groq-sdk";
import { z } from "zod";
import { ObjectSchema, ArraySchema, SchemaType, GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

// Define the expected response schema from Gemini
const ValidationResponseSchema: ObjectSchema = {
  description: "Schema for a response model.",
  type: SchemaType.OBJECT,
  properties: {
    isValid: {
      type: SchemaType.BOOLEAN,
      description: "Verdict of the question according to the rules",
      nullable: false,
    },
    errors: {
      type: SchemaType.ARRAY,
      description: "Very short description of what rule the question invalidates",
      nullable: true,
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ["isValid", "errors"],
};

const questionsSchema: ArraySchema = {
  description: "List of questions",
  type: SchemaType.ARRAY,
  items: ValidationResponseSchema,
};

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: questionsSchema,
  },
});

// Updated system prompt with stricter rules
const systemPrompt = `
You are a JSON validator. Validate the provided JSON object against the following schema and rules:

**Schema:**
- question_content: must be a non-empty string.
- options: options is an array of objects it can be empty or null, if options array is not empty then for each option, option.content should be a non-empty string.
- solution: must be an object with answer (a non-empty string) and an optional explanation (string).

**Content Relevance Rules:**
- The question_content should clearly present the problem and may include Markdown, LaTeX, and other formatting. It must not embed option details.
- Each option's content should contain option text and must not include any part of the question_content or extra explanation.
- The solution.answer should state answer (for example, "Ans. (3)" or "Ans. {Markdown Link}") without extra unrelated content.
- The solution.explanation should provide a explanation for the answer. It may reference parts of the question for clarity. It should not include data next upcoming question based on current question number.
- No field should contain data from any other question past or upcoming. For instance, if the current question number is 5, there must be no references to question 4 or 6, etc.

**Note on Formatting:**
The content may include Markdown and LaTeX formatting tags. Valid tags include, but are not limited to:
\\quad, \\Lambda, \\tag, \\begin, \\mathrm, \\hline, \\end, \\frac, \\bullet, \\alpha, \\sqrt, \\leq, \\right, \\left, \\vec, \\pm, \\sum, \\ldots, \\log, \\int, \\theta, \\max, \\mathbb, \\mathbf, \\sim, \\mathcal, \\label, \\ref, \\eqref, \\title, \\author, \\section, \\subsection, \\subsubsection, \\textit, \\textbf, \\url, \\item, \\includegraphics, \\pagebreak.
The content may also include markdown image tags, for example:
![](https://cdn.mathpix.com/cropped/2025_03_11_c6c622baaff9622738e0g-01.jpg?height=555&width=723&top_left_y=1156&top_left_x=1209)
These formatting tags are considered part of the content and should not cause validation to fail.

**Response Format:**
Respond with a JSON object indicating whether the input is valid and include an array of error messages with very short descriptions. The response should be in the format:
{
  "isValid": true/false,
  "errors": [ list of error messages if any ]
}
If the input is valid, set isValid to true and errors should be an empty array. If invalid, set isValid to false and provide appropriate error messages.

Do not include any additional text or explanations in your response.
`;

export async function validateQuestionWithGroq(jsonObject: any): Promise<{ isValid: boolean }> {
  console.log("inside validation")
  const userContent = JSON.stringify(jsonObject, null, 2);
  const prompt = systemPrompt + "\n\n" + userContent;

  try {
    // Send request to Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const finalValidation = JSON.parse(responseText);

    console.log("final validtor: ",finalValidation);

    // If finalValidation is an array, take the first element; otherwise, use it directly.
    const validation = Array.isArray(finalValidation) ? finalValidation[0] : finalValidation;
    return { isValid: validation.isValid };
  } catch (error: any) {
    console.error("Error during validation:", error);
    return { isValid:false };
    // throw new Error("Validation failed: " + error.message);
  }
}
