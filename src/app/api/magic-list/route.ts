import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magicList } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const listName = req.nextUrl.searchParams.get("list") ?? "default";
    const items = await db
      .select()
      .from(magicList)
      .where(eq(magicList.listName, listName))
      .orderBy(asc(magicList.position));
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/magic-list error:", error);
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming: string[] = Array.isArray(body?.items) ? body.items : [];
    const listName = body?.listName ?? "default";

    await db.delete(magicList).where(eq(magicList.listName, listName));

    if (incoming.length > 0) {
      const rows = incoming.map((label, index) => ({
        listName,
        label: String(label),
        position: index,
        isForceItem: false,
      }));
      await db.insert(magicList).values(rows);
    }

    const items = await db
      .select()
      .from(magicList)
      .where(eq(magicList.listName, listName))
      .orderBy(asc(magicList.position));
    return NextResponse.json(items);
  } catch (error) {
    console.error("POST /api/magic-list error:", error);
    return NextResponse.json({ error: "Failed to save list" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const listName = req.nextUrl.searchParams.get("list") ?? "default";
    await db.delete(magicList).where(eq(magicList.listName, listName));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/magic-list error:", error);
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}