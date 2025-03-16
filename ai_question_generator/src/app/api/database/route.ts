import dbConnect from "@/lib/mongo";
import { QuestionModel } from "@/model/Question";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Connect to the database.
  await dbConnect();

  // Read query parameters.
  const { searchParams } = new URL(request.url);
  const validParam = searchParams.get("valid");

  // Create a filter based on the valid query parameter.
  let filter = {};
  if (validParam !== null) {
    const isValid = validParam.toLowerCase() === "true";
    filter = { validation: isValid };
  }

  try {
    // Fetch questions using the filter.
    const questions = await QuestionModel.find(filter);
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.error();
  }
}
