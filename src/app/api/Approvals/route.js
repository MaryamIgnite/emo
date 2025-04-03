import { NextResponse } from "next/server";
import pool from "@/utils/db";

// ✅ POST: Approve or Reject a Campaign
export async function POST(req) {
  try {
    const { campaign_id, reviewed_by, is_approved, review_comment } = await req.json();

    // Insert approval log
    await pool.query(
      "INSERT INTO approvals (campaign_id, reviewed_by, is_approved, review_comment) VALUES (?, ?, ?, ?)",
      [campaign_id, reviewed_by, is_approved, review_comment]
    );

    // Update campaign status
    const newStatus = is_approved === "Y" ? "Scheduled" : "Rejected";
    await pool.query("UPDATE campaigns SET status = ?, last_updated_by = ? WHERE id = ?", [newStatus, reviewed_by, campaign_id]);

    return NextResponse.json({ success: true, message: `Campaign ${newStatus}` });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
