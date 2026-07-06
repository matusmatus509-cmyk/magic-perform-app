import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, parseInt(id)));

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("GET /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, pinned } = body;

    const updateData: Partial<{ title: string; content: string; pinned: boolean; updatedAt: Date }> = {
      updatedAt: new Date(),
    };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (pinned !== undefined) updateData.pinned = pinned;

    const [updated] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(notes).where(eq(notes.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
