import mongoose, { Schema, model } from "mongoose";




export interface QuestionDocument extends mongoose.Document {
  subject: string;
  content: string;
  options: {
    option_id: string;
    content: string;
   
  }[];
  solution: {
    answer: string;
    explanation: string;
   
  };
  difficulty_level: number;
  validation:boolean;
  summary:string
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const QuestionSchema = new Schema<QuestionDocument>(
  {
  
    subject: { type: String, required: true },
    content: { type: String, required: true },
    
  
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

    validation:{
      type:Boolean,
      required:true,
      default:true,
    },
    difficulty_level: { type: Number, default: 5 },
    summary: { type: String,required:true},
  },
  { timestamps: true },
);

// Create and export the model
export const Question =
  mongoose.models.Question ||
  model<QuestionDocument>("Question", QuestionSchema);
