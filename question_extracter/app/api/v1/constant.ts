
import { ObjectSchema, SchemaType } from "@google/generative-ai";
  
export const geminiSchema: ObjectSchema = {
  description: "Schema for a question model",
  type: SchemaType.OBJECT,
  properties: {
    n: {
      type: SchemaType.NUMBER,
      description: "Question_number (number, required)",
      nullable: false,
    },
    s: {
      type: SchemaType.STRING,
      description: "The subject area of the question, such as Mathematics, Physics, Chemistry, etc.",
      nullable: false,
    },
    c: {
      type: SchemaType.STRING,
      description: "The line number or range in the source text where the question content is located. For example, '3' indicates line 3, while '3-5' spans lines 3 to 5.",
      nullable: false,
    },
    t: {
      type: SchemaType.NUMBER,
      description: "The type of the question: 0 for multiple choice questions (MULTIPLE_CHOICE_QUESTION), 1 for numerical answer questions (NUMERICAL). Must be either 0 or 1,.",
      nullable: false,
    },
    o: {
      type: SchemaType.ARRAY,
      description: "An array of options for the question. For multiple choice questions (t=[]), this contains the available choice.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          oi: {
            type: SchemaType.NUMBER,
            description: "The index of the option, a non-negative integer starting from 0 (e.g., 0, 1, 2, ...), uniquely identifying the option within the list.",
            nullable: false,
          },
          oc: {
            type: SchemaType.STRING,
            description: "The line number or range in the source text where the option content is located. For example, '6' for line 6, or '6-7' for lines 6 to 7.",
            nullable: false,
          },
        },
        required: ["oi", "oc"],
      },
    },
   
    so: {
      type: SchemaType.OBJECT,
      description: "The solution object containing the correct answer and an explanation, providing the resolution to the question.",
      properties: {
        sa: {
          type: SchemaType.STRING,
          description: "The line number or range in the source text where the correct answer is specified. For example, '8' or '8-9'.",
          nullable: false,
        },
        se: {
          type: SchemaType.STRING,
          description: "Optional. The line number or range in the source text where the explanation for the answer is provided, for example, '10' or '10-12'.",
          nullable: true,
        },
      },
      required: ["sa"],
    },
    d: {
      type: SchemaType.NUMBER,
      description: "The difficulty level of the question,infered from the question",
      nullable: false,
    },
  },
  required: ["n", "s", "c", "t", "o", "so", "d"],
};