import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function POST(req) {
  try {
    const { insert = [], update = [] } = await req.json();
    const ops = [];

    // 🔁 INSERT new events
    insert.forEach(event => {
      ops.push(
        pool.query(
          `INSERT INTO events (
            event_title, audience, message, need, call_to_action,
            week, email_type, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            event.subject || "Untitled",
            event.to,
            event.message,
            event.need || "",
            event.call_to_action || "",
            event.week,
            event.email_type,
            event.status || "Pending Approval"
          ]
        )
      );
    });

    // ✏️ UPDATE existing events
    update.forEach(event => {
      ops.push(
        pool.query(
          `UPDATE events SET
            audience = ?, event_title = ?, message = ?, need = ?, call_to_action = ?,
            week = ?, email_type = ?, status = ?, created_at = NOW()
          WHERE id = ?`,
          [
            event.to,
            event.subject,
            event.message,
            event.need || "",
            event.call_to_action || "",
            event.week,
            event.email_type,
            event.status,
            event.id
          ]
        )
      );
    });

    await Promise.all(ops);
    return NextResponse.json({ success: true, message: "Insert/Update successful" });

  } catch (error) {
    console.error("BulkSave error:", error);
    return NextResponse.json({ error: "Bulk operation failed", details: error.message }, { status: 500 });
  }
}
