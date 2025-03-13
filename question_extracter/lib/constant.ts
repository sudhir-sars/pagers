import { ObjectSchema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';
export const geminiSchema: ObjectSchema = {
  description: "Question model schema",
  type: SchemaType.OBJECT,
  properties: {
    question_number: {
        type: SchemaType.NUMBER,
        description: "question Number",
        nullable: false,
      },
    subject: {
      type: SchemaType.STRING,
      description: "Subject of the question",
      nullable: false,
    },
    content: {
      type: SchemaType.STRING,
      description: "Content of the question",
      nullable: false,
    },
    image: {
      type: SchemaType.STRING,
      description: "Optional image associated with the question",
      nullable: true,
    },
    type: {
      type: SchemaType.STRING,
      description: "Type of the question",
      nullable: false,
    },
    options: {
      type: SchemaType.ARRAY,
      description: "List of options for the question",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          option_id: {
            type: SchemaType.STRING,
            description: "Unique identifier for the option",
            nullable: false,
          },
          content: {
            type: SchemaType.STRING,
            description: "Content of the option",
            nullable: true,
          },
          option_image: {
            type: SchemaType.STRING,
            description: "Optional image for the option",
            nullable: true,
          },
        },
        required: ["option_id"],
      },
    },
    solution: {
      type: SchemaType.OBJECT,
      description: "Solution object with answer details",
      properties: {
        answer: {
          type: SchemaType.STRING,
          description: "Correct answer for the question",
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: "Optional explanation of the answer",
          nullable: true,
        },
        solution_image: {
          type: SchemaType.STRING,
          description: "Optional image associated with the solution",
          nullable: true,
        },
      },
      required: ["answer"],
    },
    tags: {
      type: SchemaType.ARRAY,
      description: "List of tags associated with the question",
      items: {
        type: SchemaType.STRING,
        description: "A tag",
        nullable: false,
      },
  
    },
    difficulty_level: {
      type: SchemaType.NUMBER,
      description: "Difficulty level of the question ingfer it based on qestion",
 
      nullable: false,
    },
  },
  required: ["subject", "content", "type", "options", "solution"],
};


// Define Zod schemas equivalent to your geminiSchema
export const OptionSchema = z.object({
  option_id: z.string(),
  content: z.string().optional(),
  option_image: z.string().optional(),
});

export const SolutionSchema = z.object({
  answer: z.string(),
  explanation: z.string().optional(),
  solution_image: z.string().optional(),
});

export const QuestionSchema = z.object({
  question_number: z.number(),
  subject: z.string(),
  content: z.string(),
  // image: z.string().optional(),
  type: z.string(),
  options: z.array(OptionSchema),
  solution: SolutionSchema,
  tags: z.array(z.string()),
  difficulty_level: z.number(),
});




export const QuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question_number: z.number(),
      content: z.string(),
      subject: z.string(),
      type: z.string().describe("either 'numerical' or 'mulitple_choice'"),
      difficulty_level: z.number().describe('infer the question diffculity level of question'),
      tags: z.array(z.string()),
      options: z.array(
        z.object({
          option_id: z.string(),
          option_content: z.string().optional(),
        })
      ),
      solution: z.object({
        answer: z.string(),
        explanation: z.string().optional(),
      }),
    })
  ),
});

export const QuestionsObjectSchema = z.object({QuestionSchema})
