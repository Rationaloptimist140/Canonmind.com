// api/verify.ts — CanonMind JWT Verification + Upstash Redis Sliding-Window Rate Limiting
// Vercel Serverless Function: GET /api/verify
// Authorization: Bearer {sig_|can_|inst_}JWT

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify, type JWTPayload } from "jose";
import { Redis } from "@upstash/redis";

const JWT_KEY  = new TextEncoder().encode(process.env.CANONMIND_JWT_SECRET!);
const KB_TABLE = "cmqs8ogt107yl07ads5pr3whq";

// ── UPSTASH REDIS (Sliding-Window Rate Limiter) ───────────────────────────
// Set in Vercel env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!redis) {
    redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// ── TIER CONFIGURATION ────────────────────────────────────────────────────
const TIER_CONFIG = {
  1: { name: "Signal",      daily_limit: 100,   ports: [1,2,3],       rule06: false },
  2: { name: "Canon",       daily_limit: null,   ports: [1,2,3,4,5,7], rule06: true  },
  3: { name: "Institution", daily_limit: null,   ports: [1,2,3,4,5,6,7],rule06: true  },
} as const;

interface CanonPayload extends JWTPayload {
  tier: 1 | 2 | 3;
  kb?: string;
  sub_id?: string;
}

// ── SLIDING-WINDOW RATE LIMITER ───────────────────────────────────────────
async function checkSlidingWindow(
  userId: string,
  limit: number
): Promise<{ allowed: boolean; used: number; remaining: number; reset: number }> {
  const r = getRedis();
  if (!r) {
    // Redis unavailable — fail open (do not block)
    return { allowed: true, used: 0, remaining: limit, reset: 0 };
  }

  const now       = Date.now();
  const windowMs  = 86_400_000; // 24 hours
  const windowEnd = now + (windowMs - (now % windowMs));
  const key       = `canon:rate:sw:${userId}`;
  const member    = `${now}-${Math.random().toString(36).slice(2, 9)}`;

  // Atomic pipeline: prune expired entries, add current, count
  const results = await r.pipeline()
    .zremrangebyscore(key, 0, now - windowMs)  // remove entries older than 24h
    .zadd(key, { score: now, member })          // add this request
    .zcard(key)                                  // count in window
    .expire(key, 86400)                          // TTL safety
    .exec() as [number, number, number, number];

  const used      = results[2] ?? 1;
  const allowed   = used <= limit;
  const remaining = Math.max(0, limit - used);

  return { allowed, used, remaining, reset: windowEnd };
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Allow", "GET,POST,OPTIONS").end();
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── EXTRACT TOKEN ──────────────────────────────────────────────────────
  const authHeader = String(req.headers["authorization"] ?? "");
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error:   "UNAUTHORIZED",
      message: "Authorization: Bearer {api_key} required.",
      help:    "https://canonmind.com/subscribe",
    });
  }

  // Strip tier prefix (sig_, can_, inst_) before verifying
  const raw      = authHeader.slice(7);
  const jwtToken = raw.replace(/^(sig|can|inst)_/, "");

  // ── VERIFY JWT ─────────────────────────────────────────────────────────
  let payload: CanonPayload;
  try {
    const { payload: p } = await jwtVerify(jwtToken, JWT_KEY, { algorithms: ["HS256"] });
    payload = p as CanonPayload;
  } catch {
    return res.status(401).json({
      error:   "INVALID_KEY",
      message: "API key is invalid, expired, or malformed.",
      help:    "https://canonmind.com/subscribe",
    });
  }

  const tier   = payload.tier ?? 1;
  const userId = payload.sub  ?? "unknown";
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG[1];

  // ── SLIDING-WINDOW RATE LIMIT ──────────────────────────────────────────
  if (config.daily_limit !== null) {
    const rl = await checkSlidingWindow(userId, config.daily_limit);
    if (!rl.allowed) {
      return res.status(429).json({
        error:        "RATE_LIMIT_EXCEEDED",
        tier:         config.name,
        limit:        config.daily_limit,
        used:         rl.used,
        remaining:    0,
        reset_ms:     rl.reset,
        reset_human:  new Date(rl.reset).toISOString(),
        upgrade_url:  "https://canonmind.com/subscribe#canon",
      });
    }
    // Attach rate-limit headers
    res.setHeader("X-RateLimit-Limit",     String(config.daily_limit));
    res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
    res.setHeader("X-RateLimit-Reset",     String(rl.reset));
  }

  // ── PORT ACCESS GATE ───────────────────────────────────────────────────
  const requestedPort = Number(req.query.port ?? (req.body as any)?.port ?? 0);
  if (requestedPort && !(config.ports as readonly number[]).includes(requestedPort)) {
    return res.status(403).json({
      error:         "PORT_ACCESS_DENIED",
      tier:          config.name,
      port:          requestedPort,
      allowed_ports: config.ports,
      upgrade_url:   "https://canonmind.com/subscribe",
    });
  }

  // ── RULE 06 GATE ───────────────────────────────────────────────────────
  const isRule06 = req.query.rule06 === "true" || (req.body as any)?.rule06 === true;
  if (isRule06 && !config.rule06) {
    return res.status(403).json({
      error:       "RULE06_ACCESS_DENIED",
      tier:        config.name,
      message:     "Rule 06 Specialist works require Canon tier or above.",
      upgrade_url: "https://canonmind.com/subscribe#canon",
    });
  }

  // ── AUTHORIZED ─────────────────────────────────────────────────────────
  return res.status(200).json({
    authorized:  true,
    user:        userId,
    tier,
    tier_name:   config.name,
    kb:          payload.kb ?? KB_TABLE,
    kb_cap:      60,
    kb_sealed:   true,
    ports:       config.ports,
    rule06:      config.rule06,
    daily_limit: config.daily_limit ?? "unlimited",
  });
}
