import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magicList } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const { itemId, targetPosition } = await req.json();

    if (
      typeof itemId !== "number" ||
      typeof targetPosition !== "number" ||
      !Number.isInteger(targetPosition) ||
      targetPosition < 0 ||
      targetPosition > 98
    ) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const allRows = await db
      .select()
      .from(magicList)
      .orderBy(asc(magicList.position));

    const moving = allRows.find((r) => r.id === itemId);
    if (!moving) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const others = allRows.filter((r) => r.id !== itemId);

    others.splice(Math.min(targetPosition, others.length), 0, moving);

    for (let i = 0; i < others.length; i++) {
      await db
        .update(magicList)
        .set({ position: i, updatedAt: new Date() })
        .where(eq(magicList.id, others[i].id));
    }

    const refreshed = await db
      .select()
      .from(magicList)
      .orderBy(asc(magicList.position));
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error("PUT /api/magic-list/reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
