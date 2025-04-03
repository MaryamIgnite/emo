import { NextResponse } from "next/server";
import pool from "@/utils/db";

// ✅ GET: Fetch all events
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");

  try {
    if (week) {
      const [events] = await pool.query("SELECT * FROM events WHERE week = ?", [week]);
      return NextResponse.json(events);
    } else {
      return NextResponse.json({ error: "Week is required" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching events by week:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    );
  }
}


// ✅ PUT: Approve or Reject an event
export async function PUT(req) {
  try {
    const { id, status } = await req.json();

    if (!id || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or missing event ID" }, { status: 400 });
    }

    const [result] = await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Event updated to ${status}` });

  } catch (error) {
    console.error("Event Update Error:", error);
    return NextResponse.json({ error: "Event update failed", details: error.message }, { status: 500 });
  }
}
