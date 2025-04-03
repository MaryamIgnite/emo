import { NextResponse } from "next/server";
import pool from "@/utils/db";

const extractEmails = (str) => str.split(",").map((e) => e.trim());

export async function POST(req) {
  try {
    const { campaignId } = await req.json();

    const [[campaign]] = await pool.query("SELECT * FROM campaigns WHERE id = ?", [campaignId]);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const week = campaign.week;
    const currentAudience = extractEmails(campaign.audience);
    const [existingEvents] = await pool.query("SELECT * FROM events WHERE week = ?", [week]);

    const insertEvents = [];
    const updateEvents = [];
    const untouchedEvents = [];

    const mergedEmails = new Set();
    const remainingCurrentAudience = new Set(currentAudience);

    for (const event of existingEvents) {
      const eventAudience = extractEmails(event.audience);
      const overlapping = eventAudience.filter((email) => currentAudience.includes(email));

      if (overlapping.length > 0) {
        // ➕ Insert merged overlapping event
        insertEvents.push({
          to: overlapping.join(", "),
          subject: `Merged Email - Week ${week}`,
          message: `Message 1: ${event.message}\nMessage 2: ${campaign.message}`,
          need: `Need 1: ${event.need}\nNeed 2: ${campaign.need}`,
          call_to_action: `CTA 1: ${event.call_to_action}\nCTA 2: ${campaign.call_to_action}`,
          week: campaign.week,
          email_type: campaign.email_type,
          status: "Pending Approval"
        });

        overlapping.forEach(email => {
          mergedEmails.add(email);
          remainingCurrentAudience.delete(email);
        });

        // ✏️ Update remaining audience of existing event
        const remainingInEvent = eventAudience.filter(email => !overlapping.includes(email));
        if (remainingInEvent.length > 0) {
          updateEvents.push({
            id: event.id,
            to: remainingInEvent.join(", "),
            subject: event.event_title,
            message: event.message,
            need: event.need,
            call_to_action: event.call_to_action,
            week: event.week,
            email_type: event.email_type,
            status: "Pending Approval"
          });
        }

      } else {
        // 🧍‍♂️ Event not affected — keep in "This Week's Events"
        untouchedEvents.push(event);
      }
    }

    // ➕ Insert non-overlapping emails from current campaign
    if (remainingCurrentAudience.size > 0) {
      insertEvents.push({
        to: [...remainingCurrentAudience].join(", "),
        subject: campaign.subject,
        message: campaign.message,
        need: campaign.need,
        call_to_action: campaign.call_to_action,
        week: campaign.week,
        email_type: campaign.email_type,
        status: "Pending Approval"
      });
    }

    return NextResponse.json({
      insertEvents,
      updateEvents,
      untouchedEvents,
      overlapsFound: mergedEmails.size > 0
    });

  } catch (error) {
    console.error("ProcessLLM Error:", error);
    return NextResponse.json(
      { error: "LLM processing failed", details: error.message },
      { status: 500 }
    );
  }
}
