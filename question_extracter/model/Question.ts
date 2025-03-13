import mongoose, { Schema, model } from "mongoose";




export interface QuestionDocument extends mongoose.Document {
  question_number:number,
  subject: string;
  content: string;
  type: string;
  options: {
    option_id: string;
    content: string;
   
  }[];
  solution: {
    answer: string;
    explanation: string;
   
  };
  tags: string[];
  difficulty_level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const QuestionSchema = new Schema<QuestionDocument>(
  {
    question_number:{ type: Number, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    
    type: { type: String, required: true },
    options: [
      {
        option_id: { type: String, required: true },
        content: { type: String },
        option_image: { type: String },
      },
    ],
    solution: {
      answer: { type: String, required: true },
      explanation: { type: String },
    
    },
    tags: { type: [String], default: [] },
    difficulty_level: { type: Number, default: 5 },
  },
  { timestamps: true },
);

// Create and export the model
export const QuestionModel =
  mongoose.models.Question ||
  model<QuestionDocument>("Question", QuestionSchema);
