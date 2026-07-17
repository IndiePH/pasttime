import { NextResponse } from "next/server"
import { Resend } from "resend"

const FEEDBACK_CATEGORIES = ["bug", "feature", "general", "ui"] as const

type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  general: "General Feedback",
  ui: "UI / Design Issue",
}

interface FeedbackRequestBody {
  category?: string
  message?: string
  email?: string
}

function isFeedbackCategory(value: string): value is FeedbackCategory {
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(value)
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const toEmail = process.env.FEEDBACK_TO_EMAIL?.trim()
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL?.trim()

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("feedback: missing RESEND_API_KEY, FEEDBACK_TO_EMAIL, or FEEDBACK_FROM_EMAIL")
    return NextResponse.json(
      { error: "Feedback is not configured" },
      { status: 503 },
    )
  }

  let body: FeedbackRequestBody
  try {
    body = (await request.json()) as FeedbackRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const category = typeof body.category === "string" ? body.category.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""
  const email =
    typeof body.email === "string" ? body.email.trim() : ""

  if (!isFeedbackCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 })
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const label = CATEGORY_LABELS[category]
  const text = [
    `Category: ${label}`,
    email ? `Reply-to: ${email}` : "Reply-to: (not provided)",
    "",
    message,
  ].join("\n")

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: `[Pasttime Feedback] ${label}`,
    text,
    ...(email ? { replyTo: email } : {}),
  })

  if (error) {
    console.error("feedback: resend error", error)
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
