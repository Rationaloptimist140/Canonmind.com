// api/webhooks/stripe.ts
// CanonMind — Stripe Webhook Handler
// Vercel Serverless Function: POST /api/webhooks/stripe

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { SignJWT } from "jose";

// ── ENVIRONMENT VARIABLES (set in Vercel dashboard) ────────────────────────
const STRIPE_SECRET_KEY    = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET= process.env.STRIPE_WEBHOOK_SECRET!;
const JWT_SECRET_RAW       = process.env.CANONMIND_JWT_SECRET!;
const REDIS_URL            = process.env.REDIS_URL;

const stripe  = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_RAW);

// ── TIER MAP: Stripe Price ID → internal tier level ────────────────────────
const TIER_MAP: Record<string, 1 | 2 | 3> = {
  [process.env.STRIPE_PRICE_SIGNAL      ?? "price_signal"]:      1,
  [process.env.STRIPE_PRICE_CANON       ?? "price_canon"]:       2,
  [process.env.STRIPE_PRICE_INSTITUTION ?? "price_institution"]: 3,
};
const TIER_PREFIX: Record<1 | 2 | 3, string> = { 1: "sig", 2: "can", 3: "inst" };

// ── GENERATE API KEY ───────────────────────────────────────────────────────
async function generateApiKey(
  userId: string,
  tier: 1 | 2 | 3,
  subscriptionId: string
): Promise<string> {
  const prefix = TIER_PREFIX[tier];
  const jwt = await new SignJWT({
    sub:  userId,
    tier,
    sub_id: subscriptionId,
    kb:  "cmqs8ogt107yl07ads5pr3whq",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("31d")
    .sign(JWT_KEY);

  return `${prefix}_${jwt}`;
}

// ── MAIN HANDLER ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status !== "active") break;

        const priceId = sub.items.data[0]?.price.id ?? "";
        const tier    = TIER_MAP[priceId] ?? 1;
        const userId  = sub.customer as string;

        const apiKey  = await generateApiKey(userId, tier, sub.id);

        // Store in Redis (if configured) for fast lookup
        if (REDIS_URL) {
          const { default: Redis } = await import("ioredis");
          const redis = new Redis(REDIS_URL);
          await redis.setex(
            `canon:key:${userId}`,
            31 * 24 * 3600,
            JSON.stringify({ key: apiKey, tier, sub_id: sub.id })
          );
          await redis.quit();
        }

        // TODO: send API key to customer via email (e.g. Resend, SendGrid)
        console.log(`[SUBSCRIPTION] user=${userId} tier=${tier} key_prefix=${TIER_PREFIX[tier]}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.customer as string;

        if (REDIS_URL) {
          const { default: Redis } = await import("ioredis");
          const redis = new Redis(REDIS_URL);
          await redis.del(`canon:key:${userId}`);
          await redis.quit();
        }

        console.log(`[CANCELLED] user=${userId} sub=${sub.id}`);
        break;
      }

      default:
        // Unhandled event — log and return 200 to prevent Stripe retries
        console.log(`[UNHANDLED] ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Internal error" });
  }

  return res.status(200).json({ received: true });
}

// ── UTILITY: Read raw body for Stripe signature verification ───────────────
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export const config = { api: { bodyParser: false } };
