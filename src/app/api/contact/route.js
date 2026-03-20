import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const resend  = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Type-aware auto-reply content ─────────────────────────────
function getAutoReply(type, name) {
  const replies = {
    feedback: {
      subject: "Thank you for your feedback — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for taking the time to share your thoughts. Your feedback means a great deal to us — it shapes how Kairos grows and serves people better.</p>
        <p>We read every message carefully and truly appreciate you being part of this journey.</p>
        <p>With gratitude,<br/>The Kairos Team</p>
      `,
    },
    question: {
      subject: "We received your question — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out. We've received your question and will get back to you within 24 hours.</p>
        <p>In the meantime, feel free to explore Kairos and let your companion walk alongside you.</p>
        <p>Grace and peace,<br/>The Kairos Team</p>
      `,
    },
    prayer: {
      subject: "We're holding you in prayer — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for trusting us with your heart. You are not alone in this.</p>
        <p>We have received your prayer request and our team will be lifting you up. Whatever you are carrying right now, may you know that you are seen, known, and deeply loved.</p>
        <p><em>"Cast all your anxiety on him because he cares for you."</em> — 1 Peter 5:7</p>
        <p>With you,<br/>The Kairos Team</p>
      `,
    },
    partnership: {
      subject: "Thanks for your interest in partnering — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out about a partnership. We're always open to conversations about how we can work together to serve people well.</p>
        <p>A member of our team will be in touch within 2 business days.</p>
        <p>Looking forward to connecting,<br/>The Kairos Team</p>
      `,
    },
    bug: {
      subject: "Bug report received — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for reporting this issue. We've logged your report and our team will investigate it as soon as possible.</p>
        <p>Your help in making Kairos more reliable for everyone is genuinely appreciated.</p>
        <p>Thank you,<br/>The Kairos Team</p>
      `,
    },
    other: {
      subject: "We heard you — Kairos",
      body: `
        <p>Hi ${name},</p>
        <p>Thank you for getting in touch. We've received your message and will respond soon.</p>
        <p>We're grateful you reached out.</p>
        <p>Warmly,<br/>The Kairos Team</p>
      `,
    },
  }

  return replies[type] || replies.other
}

// ── Email HTML wrapper ────────────────────────────────────────
function wrapEmail(bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#060912;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#060912;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                <!-- Logo -->
                <tr>
                  <td style="padding-bottom:32px;text-align:center;">
                    <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.3em;color:#f0c060;">
                      KAIROS
                    </span>
                  </td>
                </tr>
                <!-- Card -->
                <tr>
                  <td style="background:rgba(20,29,53,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px;">
                    <div style="font-family:Georgia,serif;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.8;">
                      ${bodyHtml}
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <p style="font-family:Georgia,serif;font-size:11px;color:rgba(255,255,255,0.25);margin:0;">
                      Kairos · A Biblical AI Life Companion
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// ── POST /api/contact ─────────────────────────────────────────
export async function POST(request) {
  try {
    const { name, email, type, message } = await request.json()

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      )
    }

    const typeValue = type || "other"

    // ── 1. Save to Supabase ──────────────────────────────────
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({ name: name.trim(), email: email.trim(), type: typeValue, message: message.trim() })

    if (dbError) {
      console.error("[Contact] Supabase insert failed:", dbError.message)
      // Non-fatal — still attempt email sends
    }

    const fromAddress = process.env.CONTACT_FROM_EMAIL || "hello@kairos.app"
    const teamEmail   = process.env.CONTACT_TEAM_EMAIL  || "hello@kairos.app"

    // ── 2. Notify team ───────────────────────────────────────
    await resend.emails.send({
      from:    `Kairos <${fromAddress}>`,
      to:      [teamEmail],
      subject: `[${typeValue.toUpperCase()}] New message from ${name.trim()}`,
      html: wrapEmail(`
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Type:</strong> ${typeValue}</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;" />
        <p style="white-space:pre-wrap;">${message.trim()}</p>
      `),
    })

    // ── 3. Auto-reply to sender ──────────────────────────────
    const reply = getAutoReply(typeValue, name.trim())
    await resend.emails.send({
      from:    `Kairos <${fromAddress}>`,
      to:      [email.trim()],
      subject: reply.subject,
      html:    wrapEmail(reply.body),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Contact] Route error:", err.message)
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}