import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magicSettings, magicList } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [row] = await db
      .select()
      .from(magicSettings)
      .orderBy(desc(magicSettings.id));
    return NextResponse.json(row ?? null);
  } catch (error) {
    console.error("GET /api/magic-settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      forceItemId,
      wallpaperColor,
      launcherLabel,
      gridRows,
      gridCols,
      pagecount,
    } = body ?? {};

    const [existing] = await db
      .select()
      .from(magicSettings)
      .orderBy(desc(magicSettings.id));

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (forceItemId !== undefined) updateData.forceItemId = forceItemId;
    if (wallpaperColor !== undefined) updateData.wallpaperColor = wallpaperColor;
    if (launcherLabel !== undefined) updateData.launcherLabel = launcherLabel;
    if (gridRows !== undefined) updateData.gridRows = Number(gridRows);
    if (gridCols !== undefined) updateData.gridCols = Number(gridCols);
    if (pagecount !== undefined) updateData.pagecount = Number(pagecount);

    let row;
    if (existing) {
      [row] = await db
        .update(magicSettings)
        .set(updateData)
        .where(eq(magicSettings.id, existing.id))
        .returning();
    } else {
      [row] = await db
        .insert(magicSettings)
        .values({
          forceItemId: forceItemId ?? null,
          wallpaperColor: wallpaperColor ?? "#0b1f3a",
          launcherLabel: launcherLabel ?? "Notes",
          gridRows: Number(gridRows ?? 5),
          gridCols: Number(gridCols ?? 4),
          pagecount: Number(pagecount ?? 3),
        })
        .returning();
    }

    if (forceItemId !== undefined) {
      await db.update(magicList).set({ isForceItem: false });
      if (typeof forceItemId === "number") {
        await db
          .update(magicList)
          .set({ isForceItem: true })
          .where(eq(magicList.id, forceItemId));
      }
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("PUT /api/magic-settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
