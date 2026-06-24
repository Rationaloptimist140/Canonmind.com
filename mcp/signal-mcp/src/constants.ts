#!/usr/bin/env node
// ── CANONMIND SYSTEM CONSTANTS (IMMUTABLE) ───────────────────────────────────
// These values are sealed. Modification requires formal CanonGuardian review.

/** Hyperagent Core Canon Seed List table identifier */
export const KB_TABLE_ID = "cmqs8ogt107yl07ads5pr3whq" as const;

/** Maximum number of active INTEGRATE entries. Sealed at Phase 05 Batch 005. */
export const KB_CAP = 60 as const;

/** Constant 08: The cap is a design decision, not a technical limitation. */
export const CONSTANT_08 = `Constant 08: The KB is sealed at ${KB_CAP}/60. \
The library grows by replacing, not accumulating. Write and mutation operations \
are architecturally prohibited. All integrations pass through formal CanonGuardian \
batch review before entry. This endpoint is permanently read-only.` as const;

/** Canon Score minimum threshold for INTEGRATE status */
export const INTEGRATE_THRESHOLD = 8.0 as const;

/** Timelessness weight multiplier */
export const TIMELESSNESS_WEIGHT = 2 as const;

/** 2050 Test question */
export const TIMELESSNESS_TEST =
  "Will this still be discussed AND taught in 2050?" as const;

/** Write rejection error code */
export const WRITE_REJECT_CODE = "CANON_WRITE_REJECTED" as const;

/** Mutation patterns that trigger Constant 08 rejection */
export const MUTATION_PATTERNS = [
  "add_work", "delete_work", "update_work", "insert_work",
  "upsert_work", "write_work", "mutate_work", "patch_work",
  "create_entry", "remove_entry", "modify_score",
  "override_verdict", "bypass_guard", "unlock_kb",
  "set_status", "change_status",
] as const;

/** Mediums available in the KB */
export type Medium = "film" | "music" | "literature" | "visual-art";
export const MEDIUMS: Medium[] = ["film", "music", "literature", "visual-art"];

/** Port identifiers */
export const PORTS = {
  RECOMMENDATION:  1,
  CURRICULUM:      2,
  FAMILY_TRACK:    3,
  STREAMING:       4,
  OOC_PROTOCOL:    5,
  CANONGUARDIAN:   6,
  LEARNING_PATH:   7,
} as const;
