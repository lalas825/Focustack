import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customUrl = searchParams.get("url");

  // Derive webhook URL from the request or use custom param
  const host = customUrl || request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const webhookUrl = customUrl || `${protocol}://${host}/api/telegram/webhook`;

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const data = await res.json();

  return NextResponse.json({
    webhook_url: webhookUrl,
    telegram_response: data,
  });
}
