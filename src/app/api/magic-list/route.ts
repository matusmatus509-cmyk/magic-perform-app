import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magicList } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(magicList)
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

    await db.delete(magicList);

    if (incoming.length > 0) {
      const rows = incoming.map((label, index) => ({
        label: String(label),
        position: index,
        isForceItem: false,
      }));
      await db.insert(magicList).values(rows);
    }

    const items = await db
      .select()
      .from(magicList)
      .orderBy(asc(magicList.position));
    return NextResponse.json(items);
  } catch (error) {
    console.error("POST /api/magic-list error:", error);
    return NextResponse.json({ error: "Failed to save list" }, { status: 500 });
  }
}
