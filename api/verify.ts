// api/verify.ts
// CanonMind — JWT Verification + Rate Limiting Middleware
// Vercel Serverless Function: GET /api/verify
// Usage: Authorization: Bearer {sig_|can_|inst_}JWT

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify, type JWTPayload } from "jose";

const JWT_KEY  = new TextEncoder().encode(process.env.CANONMIND_JWT_SECRET!);
const REDIS_URL = process.env.REDIS_URL;
const KB_TABLE  = "cmqs8ogt107yl07ads5pr3whq";

// ── TIER CONFIGURATION ────────────────────────────────────────────────────
const TIER_CONFIG = {
  1: { name: "Signal",      daily_limit: 100, ports: [1, 2, 3],    rule06: false },
  2: { name: "Canon",       daily_limit: null, ports: [1,2,3,4,5,7], rule06: true  },
  3: { name: "Institution", daily_limit: null, ports: [1,2,3,4,5,6,7], rule06: true },
} as const;

interface CanonJWTPayload extends JWTPayload {
  tier: 1 | 2 | 3;
  kb:   string;
  sub_id?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── EXTRACT BEARER TOKEN ───────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Authorization: Bearer {api_key} required. Get a key at canonmind.com",
    });
  }

  // Strip prefix (sig_, can_, inst_) then verify JWT
  const raw = authHeader.slice(7);
  const jwtToken = raw.replace(/^(sig|can|inst)_/, "");

  // ── VERIFY JWT ─────────────────────────────────────────────────────────
  let payload: CanonJWTPayload;
  try {
    const { payload: p } = await jwtVerify(jwtToken, JWT_KEY, {
      algorithms: ["HS256"],
    });
    payload = p as CanonJWTPayload;
  } catch (err) {
    return res.status(401).json({
      error:   "INVALID_KEY",
      message: "API key is invalid, expired, or malformed.",
    });
  }

  const tier   = payload.tier ?? 1;
  const userId = payload.sub  ?? "unknown";
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG[1];

  // ── RATE LIMITING (Redis token bucket) ────────────────────────────────
  if (REDIS_URL && config.daily_limit !== null) {
    const { default: Redis } = await import("ioredis");
    const redis = new Redis(REDIS_URL);
    const key   = `canon:rate:${userId}:${new Date().toISOString().slice(0, 10)}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 86400); // reset daily
    }
    await redis.quit();

    if (current > config.daily_limit) {
      return res.status(429).json({
        error:       "RATE_LIMIT_EXCEEDED",
        tier:        config.name,
        limit:       config.daily_limit,
        used:        current,
        reset:       "midnight UTC",
        upgrade_url: "canonmind.com/#pricing",
      });
    }
  }

  // ── VALIDATE PORT ACCESS ───────────────────────────────────────────────
  const requestedPort = Number(req.query.port ?? req.body?.port ?? 0);
  if (requestedPort && !config.ports.includes(requestedPort as any)) {
    return res.status(403).json({
      error:       "PORT_ACCESS_DENIED",
      tier:        config.name,
      port:        requestedPort,
      allowed_ports: config.ports,
      upgrade_url:  "canonmind.com/#pricing",
    });
  }

  // ── RULE 06 GATE ───────────────────────────────────────────────────────
  const isRule06Request = req.query.rule06 === "true" || req.body?.rule06 === true;
  if (isRule06Request && !config.rule06) {
    return res.status(403).json({
      error:    "RULE06_ACCESS_DENIED",
      tier:     config.name,
      message:  "Rule 06 Specialist works (Stalker, The Mirror, Andrei Rublev, Au Hasard Balthazar) require Canon tier or above.",
      upgrade:  "canonmind.com/#pricing",
    });
  }

  // ── AUTHORIZED ────────────────────────────────────────────────────────
  return res.status(200).json({
    authorized: true,
    user:       userId,
    tier:       tier,
    tier_name:  config.name,
    kb:         KB_TABLE,
    ports:      config.ports,
    rule06:     config.rule06,
    daily_limit: config.daily_limit ?? "unlimited",
    kb_cap:     60,
    kb_sealed:  true,
  });
}
