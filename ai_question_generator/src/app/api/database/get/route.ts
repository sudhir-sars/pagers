import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import { AiQuestion } from "@/model/AiQuestion";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || "";
    const subcategory = url.searchParams.get("subcategory") || "";
    
    // Assuming you store the category and subcategory as "topic" and "subtopic"
    const questions = await AiQuestion.find({ topic: category, subtopic: subcategory });
    console.log(`Fetched ${questions.length} questions for topic "${category}" and subtopic "${subcategory}"`);
    
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
