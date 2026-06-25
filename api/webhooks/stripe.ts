// api/webhooks/stripe.ts — CanonMind Stripe Webhook + Resend Onboarding
// Vercel Serverless Function: POST /api/webhooks/stripe

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { SignJWT } from "jose";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WHSEC   = process.env.STRIPE_WEBHOOK_SECRET!;
const JWT_KEY = new TextEncoder().encode(process.env.CANONMIND_JWT_SECRET!);
const resend  = new Resend(process.env.RESEND_API_KEY!);

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
}

const TIER_MAP: Record<string, 1|2|3> = {
  [process.env.STRIPE_PRICE_SIGNAL      ?? "price_signal"]:      1,
  [process.env.STRIPE_PRICE_CANON       ?? "price_canon"]:       2,
  [process.env.STRIPE_PRICE_INSTITUTION ?? "price_institution"]: 3,
};
const TIER_NAMES: Record<1|2|3, string> = { 1:"Signal", 2:"Canon", 3:"Institution" };
const TIER_PORTS: Record<1|2|3, number[]> = {
  1: [1,2,3], 2: [1,2,3,4,5,7], 3: [1,2,3,4,5,6,7],
};
const TIER_PREFIX: Record<1|2|3, string> = { 1:"sig", 2:"can", 3:"inst" };

// ── RULE 06 INITIAL STATE ────────────────────────────────────────────────
const R06_INITIAL: Record<string, string> = {
  "Andrei Rublev":       "0",
  "The Mirror":          "0",
  "Stalker":             "0",
  "Au Hasard Balthazar": "0",
};

// ── GENERATE SIGNED API KEY ───────────────────────────────────────────────
async function generateApiKey(userId: string, tier: 1|2|3, subId: string): Promise<string> {
  const jwt = await new SignJWT({ sub: userId, tier, sub_id: subId, kb: "cmqs8ogt107yl07ads5pr3whq" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("32d")
    .sign(JWT_KEY);
  return `${TIER_PREFIX[tier]}_${jwt}`;
}

// ── WELCOME EMAIL ─────────────────────────────────────────────────────────
function buildWelcomeEmail(apiKey: string, tier: 1|2|3, email: string): string {
  const name  = TIER_NAMES[tier];
  const ports = TIER_PORT_LABELS[tier];
  const prefix= TIER_PREFIX[tier];
  const limit = tier === 1 ? "100 calls/day" : "Unlimited";
  const rule06= tier > 1 ? "✓ Rule 06 specialist works unlocked (Stalker, The Mirror, Andrei Rublev, Au Hasard Balthazar)" : "✗ Rule 06 not included (upgrade to Canon)";
  const keyShort = `${prefix}_${apiKey.slice(prefix.length + 1, prefix.length + 12)}...`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{background:#09090A;color:#F2EDDF;font-family:Inter,system-ui,sans-serif;margin:0;padding:40px 20px}
  .wrap{max-width:560px;margin:0 auto}
  .logo{font-family:Georgia,serif;font-size:1.1rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#F2EDDF;margin-bottom:32px}
  h1{font-family:Georgia,serif;font-size:1.8rem;font-weight:700;line-height:1.1;color:#F2EDDF;margin-bottom:8px}
  h1 em{font-style:italic;color:#C4922A}
  .sub{font-size:0.9rem;color:rgba(242,237,223,0.6);margin-bottom:28px}
  .key-box{background:#161614;border:1px solid rgba(196,146,42,0.3);padding:16px 18px;font-family:'Courier New',monospace;font-size:0.7rem;color:#C4922A;word-break:break-all;margin:20px 0}
  .key-label{font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:rgba(242,237,223,0.4);margin-bottom:6px}
  .feature{font-size:0.82rem;color:rgba(242,237,223,0.6);padding:6px 0;border-bottom:1px solid rgba(242,237,223,0.07)}
  .feature:last-child{border-bottom:none}
  .btn{display:inline-block;padding:12px 24px;background:#C4922A;color:#09090A;font-size:0.72rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;margin-top:24px}
  .footer{margin-top:40px;font-size:0.72rem;color:rgba(242,237,223,0.3);border-top:1px solid rgba(242,237,223,0.07);padding-top:16px}
</style></head><body>
<div class="wrap">
  <div class="logo">CanonMind</div>
  <h1>Welcome to<br><em>${name}.</em></h1>
  <p class="sub">Your API key is ready. 60 quality-gated works. Zero noise.</p>
  <div class="key-label">Your API Key (${name} · ${limit})</div>
  <div class="key-box">${apiKey}</div>
  <p style="font-size:0.78rem;color:rgba(242,237,223,0.4);margin-bottom:20px">
    Keep this key private. Use as: <code>Authorization: Bearer {key}</code>
  </p>
  <div style="margin:20px 0">
    <div class="feature">✓ Access to ${ports}</div>
    <div class="feature">✓ ${limit} to the sealed Canon KB (60 works)</div>
    <div class="feature">${rule06}</div>
    <div class="feature">✓ signal-mcp: configure in Claude Desktop or Cursor</div>
    <div class="feature">✓ Core Manual: canonmind.com/manual</div>
  </div>
  <a class="btn" href="https://canonmind.com/dashboard?token=${encodeURIComponent(apiKey)}">
    Open Your Dashboard →
  </a>
  <div class="footer">
    canonmind.com · KB: cmqs8ogt107yl07ads5pr3whq · 60/60 sealed<br>
    Questions? Reply to this email or check canonmind.com/manual
  </div>
</div></body></html>`;
}

const TIER_PORT_LABELS: Record<1|2|3, string> = {
  1: "Ports 01, 02, 03",
  2: "Ports 01–05 + 07",
  3: "All 7 Ports",
};

// ── ONBOARDING ────────────────────────────────────────────────────────────
async function runOnboarding(userId: string, email: string, tier: 1|2|3, subId: string) {
  const apiKey = await generateApiKey(userId, tier, subId);
  const r      = getRedis();

  if (r) {
    await r.pipeline()
      // Store API key
      .setex(`canon:key:${userId}`, 32 * 86400, JSON.stringify({ key: apiKey, tier, sub_id: subId }))
      // Initialize Rule 06 progress
      .hset(`canon:r06:${userId}`, { ...R06_INITIAL, onboarded: new Date().toISOString() })
      // Mark dashboard unlocked
      .set(`canon:onboarded:${userId}`, "1")
      .exec();
  }

  // Send welcome email via Resend
  await resend.emails.send({
    from:    "CanonMind <access@canonmind.com>",
    to:      email,
    subject: `Your CanonMind ${TIER_NAMES[tier]} API key`,
    html:    buildWelcomeEmail(apiKey, tier, email),
  });

  console.log(`[ONBOARDED] user=${userId} tier=${tier} email=${email.replace(/(.{2}).+(@.+)/, '$1***$2')}`);
  return apiKey;
}

// ── WEBHOOK HANDLER ───────────────────────────────────────────────────────
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await getRawBody(req), sig, WHSEC);
  } catch {
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub    = event.data.object as Stripe.Subscription;
        if (sub.status !== "active") break;
        const priceId= sub.items.data[0]?.price.id ?? "";
        const tier   = TIER_MAP[priceId] ?? 1;
        const cusId  = sub.customer as string;

        // Fetch customer email
        const customer = await stripe.customers.retrieve(cusId) as Stripe.Customer;
        const email    = customer.email ?? "";
        if (!email) { console.warn(`No email for customer ${cusId}`); break; }

        await runOnboarding(cusId, email, tier, sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const r   = getRedis();
        if (r) {
          await r.pipeline()
            .del(`canon:key:${sub.customer}`)
            .del(`canon:onboarded:${sub.customer}`)
            .exec();
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Processing failed" });
  }

  return res.status(200).json({ received: true });
}

export const config = { api: { bodyParser: false } };
