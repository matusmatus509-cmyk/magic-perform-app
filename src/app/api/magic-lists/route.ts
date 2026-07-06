import { NextResponse } from "next/server";
import { db } from "@/db";
import { magicList } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({ name: magicList.listName })
      .from(magicList)
      .groupBy(magicList.listName)
      .orderBy(magicList.listName);
    return NextResponse.json(rows.map((r) => r.name));
  } catch (error) {
    console.error("GET /api/magic-lists error:", error);
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

void sql;