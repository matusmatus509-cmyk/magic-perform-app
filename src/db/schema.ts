import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

export const magicList = pgTable("magic_list", {
  id: serial("id").primaryKey(),
  listName: text("list_name").notNull().default("default"),
  label: text("label").notNull(),
  position: integer("position").notNull(),
  isForceItem: boolean("is_force_item").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MagicListItem = typeof magicList.$inferSelect;
export type InsertMagicListItem = typeof magicList.$inferInsert;

export const magicSettings = pgTable("magic_settings", {
  id: serial("id").primaryKey(),
  forceItemId: integer("force_item_id"),
  currentList: text("current_list").notNull().default("default"),
  wallpaperColor: text("wallpaper_color").notNull().default("#0b1f3a"),
  launcherLabel: text("launcher_label").notNull().default("Notes"),
  gridRows: integer("grid_rows").notNull().default(5),
  gridCols: integer("grid_cols").notNull().default(4),
  pagecount: integer("page_count").notNull().default(3),
  noteTitleTemplate: text("note_title_template").notNull().default(""),
  noteContentFormat: text("note_content_format").notNull().default("numbered"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MagicSettings = typeof magicSettings.$inferSelect;
export type InsertMagicSettings = typeof magicSettings.$inferInsert;