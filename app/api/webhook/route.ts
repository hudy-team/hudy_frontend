import { NextRequest } from "next/server";
import { getPaddleInstance } from "@/lib/paddle/get-paddle-instance";
import { processWebhookEvent } from "@/lib/paddle/process-webhook";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") || "";
  const rawRequestBody = await request.text();
  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "";

  try {
    if (!signature || !rawRequestBody) {
      return Response.json(
        { error: "Missing signature or body" },
        { status: 400 }
      );
    }

    if (!privateKey) {
      console.error("PADDLE_NOTIFICATION_WEBHOOK_SECRET not configured");
      return Response.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(
      rawRequestBody,
      privateKey,
      signature
    );

    if (!eventData) {
      return Response.json(
        { error: "Failed to parse webhook" },
        { status: 400 }
      );
    }

    const eventName = eventData.eventType ?? "Unknown";
    console.log(`[webhook] Received: ${eventName}`);

    await processWebhookEvent(eventData);

    console.log(`[webhook] Processed: ${eventName}`);
    return Response.json({ status: 200, eventName });
  } catch (e) {
    console.error("[webhook] Error:", e);
    return Response.json(
      {
        error: "Internal server error",
        details: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
