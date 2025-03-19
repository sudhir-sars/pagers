import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import { AiQuestion } from "@/model/AiQuestion";

export async function GET(request) {
  try {
    await dbConnect();
    // Aggregate to group by topic and subtopic and count the documents
    const counts = await AiQuestion.aggregate([
      {
        $group: {
          _id: { topic: "$topic", subtopic: "$subtopic" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the aggregation result into an object with keys like "Algebra-Sets, Relations, and Functions"
    const countObj = {};
    counts.forEach((doc) => {
      const key = `${doc._id.topic}-${doc._id.subtopic}`;
      countObj[key] = doc.count;
    });

    return NextResponse.json({ success: true, counts: countObj });
  } catch (error) {
    console.error("Error counting questions:", error);
    return NextResponse.json(
      { error: "Failed to count questions", counts: {} },
      { status: 500 }
    );
  }
}
