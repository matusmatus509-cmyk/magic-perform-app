import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allNotes = await db
      .select()
      .from(notes)
      .orderBy(desc(notes.updatedAt));
    return NextResponse.json(allNotes);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title = "", content = "" } = body;

    const [note] = await db
      .insert(notes)
      .values({ title, content })
      .returning();

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
