import { KB_TABLE_ID, TIMELESSNESS_TEST } from "../constants.js";
import { findWork } from "../kb.js";

export async function handleGetWork(args: Record<string, unknown>) {
  const query = String(args.query ?? "").trim();
  if (!query) throw new Error("query is required");

  const work = findWork(query);
  if (!work) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          found:    false,
          query,
          message:  `"${query}" is not in the sealed Canon KB (${KB_TABLE_ID}). ` +
                    `Use canon_score_ooc to run an Out-of-Canon assessment.`,
          ooc_tool: "canon_score_ooc",
        }, null, 2),
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        found:     true,
        source:    KB_TABLE_ID,
        work: {
          title:                work.title,
          creator:              work.creator,
          year:                 work.year,
          medium:               work.medium,
          canon_score:          work.score,
          timelessness_score:   work.timelessness,
          timelessness_test:    TIMELESSNESS_TEST,
          status:               work.status,
          rule06_advisory:      work.rule06 ?? false,
          onramp_required:      work.onramp ?? null,
          maturity_routing:     work.maturity ?? "Clean",
          learning_paths:       work.paths ?? [],
          ccf_available:        true,
          streaming_tier:       "Criterion Channel [Priority] → MUBI → Kanopy",
        },
      }, null, 2),
    }],
  };
}
