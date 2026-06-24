import {
  KB_TABLE_ID, INTEGRATE_THRESHOLD, TIMELESSNESS_WEIGHT,
  TIMELESSNESS_TEST,
} from "../constants.js";
import { KB as KB_DATA, findWork } from "../kb.js";

function estimateDimension(field: string, year: number): number {
  // Conservative heuristic scoring for OOC works
  const age = 2026 - year;
  if (field === "timelessness") {
    if (year < 1900) return 10;
    if (year < 1970) return Math.min(10, 7 + Math.floor(age / 15));
    if (year < 2000) return Math.min(9, 6 + Math.floor(age / 10));
    if (year < 2010) return Math.min(7, 4 + Math.floor(age / 5));
    return Math.min(5, 2 + Math.floor(age / 3)); // post-2010
  }
  return 7; // default for other dimensions without full analysis
}

export async function handleOOCScore(args: Record<string, unknown>) {
  const title   = String(args.title ?? "").trim();
  const creator = String(args.creator ?? "").trim();
  const year    = Number(args.year ?? 0);
  const medium  = String(args.medium ?? "").trim();

  // Check if it's actually in the KB
  const existing = findWork(title) ?? findWork(creator);
  if (existing) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ooc: false,
          message: `"${title}" IS in the sealed Canon KB. Use canon_get_work for full metadata.`,
          found: existing,
        }, null, 2),
      }],
    };
  }

  const tl = estimateDimension("timelessness", year);
  const isPost2010 = year > 2010;
  const isPost1990 = year > 1990;

  // Conservative OOC estimates (real scoring requires full CanonGuardian review)
  const dims = {
    craft:        7,
    human_truth:  7,
    timelessness: tl,
    coherence:    7,
    educational:  7,
    accessibility:7,
  };

  const weighted =
    (dims.craft + dims.human_truth + (dims.timelessness * TIMELESSNESS_WEIGHT) +
     dims.coherence + dims.educational + dims.accessibility) / 7;

  const roundedScore = Math.round(weighted * 10) / 10;

  let classification: string;
  let verdict: string;
  if (isPost2010) {
    classification = "MONITOR";
    verdict = `Post-2010 default MONITOR (minimum 10-year endurance period). ` +
              `Estimated score ${roundedScore} — formal assessment deferred.`;
  } else if (roundedScore >= INTEGRATE_THRESHOLD && !isPost1990) {
    classification = "CANDIDATE_FOR_BATCH_REVIEW";
    verdict = `Pre-1990 work with estimated score ${roundedScore}. ` +
              `Submit for formal CanonGuardian Batch Review to confirm integration.`;
  } else if (roundedScore >= INTEGRATE_THRESHOLD) {
    classification = "STRONG_MONITOR";
    verdict = `Post-1990 work. Timelessness evidence insufficient. ` +
              `Monitor for 10+ years before batch review.`;
  } else {
    classification = "BELOW_THRESHOLD";
    verdict = `Estimated score ${roundedScore} below 8.0 threshold. ` +
              `Does not meet INTEGRATE criteria under current formula.`;
  }

  // Find closest KB equivalent
  const sameMedium = KB_DATA.filter(w => w.medium === medium);
  const closest = sameMedium.sort((a, b) => b.score - a.score)[0] ?? KB_DATA[0];

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        ooc:             true,
        query:           { title, creator, year, medium },
        source:          KB_TABLE_ID,
        timelessness_test: TIMELESSNESS_TEST,
        estimated_scores: {
          craft:          dims.craft,
          human_truth:    dims.human_truth,
          [`timelessness_x${TIMELESSNESS_WEIGHT}`]: dims.timelessness * TIMELESSNESS_WEIGHT,
          coherence:      dims.coherence,
          educational:    dims.educational,
          accessibility:  dims.accessibility,
          weighted_total: roundedScore,
        },
        flags: {
          post_2010: isPost2010,
          post_1990: isPost1990,
          monitor_default: isPost2010,
        },
        classification,
        verdict,
        kb_redirect: {
          title:   closest.title,
          creator: closest.creator,
          year:    closest.year,
          score:   closest.score,
          note:    `Closest ${medium} equivalent in sealed KB`,
        },
        note: "OOC scores are rapid estimates. All formal integrations require CanonGuardian batch review.",
      }, null, 2),
    }],
  };
}
