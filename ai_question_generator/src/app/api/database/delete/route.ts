import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import { AiQuestion } from "@/model/AiQuestion";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deletedQuestion = await AiQuestion.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    console.log(`Deleted question with id: ${id}`);
    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
