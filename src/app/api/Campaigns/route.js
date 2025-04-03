import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("id"); // Get campaign ID from query param

    if (campaignId) {
      // ✅ Fetch a single campaign by ID
      const [rows] = await pool.query("SELECT * FROM campaigns WHERE id = ?", [campaignId]);

      if (rows.length === 0) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      const campaign = rows[0];
      campaign.audience = campaign.audience ? campaign.audience.split(",") : []; // Convert to array

      return NextResponse.json(campaign);
    }

    // ✅ Fetch all campaigns if no ID is provided
    const [allRows] = await pool.query("SELECT * FROM campaigns");
    const campaigns = allRows.map(campaign => ({
      ...campaign,
      audience: campaign.audience ? campaign.audience.split(",") : [],
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }
}

// ✅ POST: Create a new campaign
export async function POST(req) {
  try {


    const body = await req.json();
    const { audience, subject, message, need, week, frequency, call_to_action, email_type } = body;

    
    const created_by = "Admin";
    const last_updated_by = "Admin";

    const [result] = await pool.query(
      `INSERT INTO campaigns 
      (audience, subject, message, need, week, frequency, call_to_action, email_type, created_by, last_updated_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [audience, subject, message, need, week, frequency, call_to_action, email_type, created_by, last_updated_by]
    );

    console.log("Insert Success:", result['insertId']); 


    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// ✅ PUT: Update a campaign by ID
export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("Updating Campaign:", body);

    const { id, audience, subject, message, need, week, frequency, call_to_action, email_type, status, last_updated_by } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required for updating" }, { status: 400 });
    }

    const audienceString = Array.isArray(audience) ? audience.join(",") : audience;

    const [result] = await pool.query(
      `UPDATE campaigns 
      SET audience = ?, subject = ?, message = ?, need = ?, week = ?, frequency = ?, call_to_action = ?, email_type = ?, status = ?, last_updated_by = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [audienceString, subject, message, need, week, frequency, call_to_action, email_type, status, last_updated_by, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Campaign not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: id });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove a campaign by ID
export async function DELETE(req) {
  try {
    const body = await req.json();
    console.log(body)
    const campaignId = body.id; // Extract ID from request body
    console.log(campaignId)

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required for deletion" }, { status: 400 });
    }

    const [result] = await pool.query("DELETE FROM campaigns WHERE id = ?", [campaignId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Campaign deleted successfully" });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }
}


async function processCampaignsWithLLM() {
  try {
    // ✅ Step 1: Fetch all campaigns
    const [campaigns] = await pool.query("SELECT id, audience, message, need, call_to_action, week, email_type FROM campaigns");

    if (campaigns.length === 0) {
      return NextResponse.json({ message: "No campaigns found to process." }, { status: 400 });
    }

    // ✅ Step 2: Group campaigns by week
    const weekGroups = {};
    campaigns.forEach(campaign => {
      if (!weekGroups[campaign.week]) {
        weekGroups[campaign.week] = [];
      }
      weekGroups[campaign.week].push(campaign);
    });

    const processedCampaigns = new Set(); // ✅ Keep track of processed campaigns

    for (const week in weekGroups) {
      const campaignsInWeek = weekGroups[week];
      const emailMap = new Map();

      campaignsInWeek.forEach(campaign => {
        const emails = campaign.audience.split(",");
        emails.forEach(email => {
          if (!emailMap.has(email)) {
            emailMap.set(email, []);
          }
          emailMap.get(email).push(campaign);
        });
      });

      // ✅ Step 3: Create Events for Overlapping Emails
      for (const [email, campaigns] of emailMap.entries()) {
        if (campaigns.length > 1) {
          const eventTitle = `Scheduled Email - Week ${week}`;
          const productCategories = new Set(campaigns.map(c => c.email_type));

          for (const category of productCategories) {
            const relatedCampaigns = campaigns.filter(c => c.email_type === category);

            // ✅ Merge messages for readability
            const mergedMessage = relatedCampaigns.map((c, i) => `Message ${i + 1}: ${c.message}`).join("\n\n");
            const mergedNeed = relatedCampaigns.map((c, i) => `Need ${i + 1}: ${c.need}`).join("\n\n");
            const mergedCTA = relatedCampaigns.map((c, i) => `CTA ${i + 1}: ${c.call_to_action}`).join("\n\n");

            // ✅ Insert Merged Event
            await pool.query(
              "INSERT INTO events (event_title, audience, message, need, call_to_action, week, email_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
              [eventTitle, email, mergedMessage, mergedNeed, mergedCTA, week, category, "Pending Approval"]
            );

            // ✅ Mark these campaigns as processed
            relatedCampaigns.forEach(c => processedCampaigns.add(c.id));
          }

          // ✅ Remove processed emails from original campaigns
          for (const campaign of campaigns) {
            const newAudience = campaign.audience.split(",").filter(e => e !== email).join(",");
            await pool.query("UPDATE campaigns SET audience = ? WHERE id = ?", [newAudience, campaign.id]);
          }
        }
      }

      // ✅ Step 4: Convert Remaining Non-Overlapping Campaigns to Events
      for (const campaign of campaignsInWeek) {
        if (!processedCampaigns.has(campaign.id)) {
          await pool.query(
            "INSERT INTO events (event_title, audience, message, need, call_to_action, week, email_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
            [`Scheduled Email - Week ${campaign.week}`, campaign.audience, campaign.message, campaign.need, campaign.call_to_action, campaign.week, campaign.email_type, "Pending Approval"]
          );

          processedCampaigns.add(campaign.id); // ✅ Mark non-overlapping campaigns as processed
        }
      }
    }

    // ✅ Step 5: Double-check all campaigns were processed before deleting
    const [remainingCampaigns] = await pool.query("SELECT id FROM campaigns WHERE id NOT IN (?)", [[...processedCampaigns]]);
    
    if (remainingCampaigns.length > 0) {
      console.warn("⚠️ Warning: Some campaigns were not processed! Investigate:");
      console.warn(remainingCampaigns);
    } else {
      await pool.query("DELETE FROM campaigns WHERE id IN (?)", [[...processedCampaigns]]);
    }

    return NextResponse.json({ success: true, message: "All campaigns processed into events successfully." });

  } catch (error) {
    console.error("LLM Processing Error:", error);
    return NextResponse.json({ error: "LLM Processing failed", details: error.message }, { status: 500 });
  }
}



