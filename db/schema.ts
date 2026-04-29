import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  longtext,
  timestamp,

} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 甲油胶产品表
export const products = mysqlTable("products", {
  id: serial("id"),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  brand: varchar("brand", { length: 255 }).notNull(),
  shadeCode: varchar("shadeCode", { length: 255 }).notNull(),
  shadeName: varchar("shadeName", { length: 255 }),
  colorHex: varchar("colorHex", { length: 7 }).notNull().default("#CCCCCC"),
  note: text("note"),
  swatchImages: longtext("swatchImages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// 标签表（色系/功能）
export const tags = mysqlTable("tags", {
  id: serial("id"),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["color", "function"]).notNull(),
  colorHex: varchar("colorHex", { length: 7 }), // 仅色系标签使用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

// 产品标签关联表
export const productTags = mysqlTable("productTags", {
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  tagId: bigint("tagId", { mode: "number", unsigned: true }).notNull(),
});

export type ProductTag = typeof productTags.$inferSelect;

// 识别记录表
export const recognitionRecords = mysqlTable("recognitionRecords", {
  id: serial("id"),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  imageData: longtext("imageData").notNull(), // base64 原图
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  result: longtext("result"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RecognitionRecord = typeof recognitionRecords.$inferSelect;

// 识别出的产品类型（前端/JSON 使用）
export interface RecognizedProduct {
  id: string;           // 临时 ID
  imageData: string;      // 裁切后的小方图 base64
  regionImage: string;    // 完整条目区域 base64（供对照）
  brand: string;
  shadeCode: string;
  shadeName?: string;
  colorHex?: string;      // 提取的主色调
  tagIds?: number[];      // 选中的标签 ID
  isNailPolish: boolean;
}
