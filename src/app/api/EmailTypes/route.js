import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM email_types");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
