import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// <CHANGE> Added environment variable validation and error handling
if (!process.env.DATABASE_URL) {
  console.error("[v0] DATABASE_URL environment variable is not set")
  throw new Error("DATABASE_URL environment variable is required")
}

console.log("[v0] Initializing database connection...")

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

console.log("[v0] Database connection initialized successfully")

export * from "./schema"
