import { KB, KB_TABLE_ID, KB_CAP, INTEGRATE_THRESHOLD, type Medium } from "../constants.js";
import { KB as KB_DATA } from "../kb.js";

export async function handleListWorks(args: Record<string, unknown>) {
  const medium       = (args.medium as string | undefined) ?? "all";
  const minScore     = (args.min_score as number | undefined) ?? INTEGRATE_THRESHOLD;
  const includeR06   = (args.include_rule06 as boolean | undefined) ?? true;

  let results = KB_DATA.filter(w => {
    if (medium !== "all" && w.medium !== medium) return false;
    if (w.score < minScore) return false;
    if (!includeR06 && w.rule06) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const byMedium = {
    film:         results.filter(w => w.medium === "film").length,
    music:        results.filter(w => w.medium === "music").length,
    literature:   results.filter(w => w.medium === "literature").length,
    "visual-art": results.filter(w => w.medium === "visual-art").length,
  };

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        source:    KB_TABLE_ID,
        kb_cap:    KB_CAP,
        returned:  results.length,
        filters:   { medium, min_score: minScore, include_rule06: includeR06 },
        breakdown: byMedium,
        works:     results.map(w => ({
          title:     w.title,
          creator:   w.creator,
          year:      w.year,
          medium:    w.medium,
          score:     w.score,
          status:    w.status,
          rule06:    w.rule06 ?? false,
          maturity:  w.maturity ?? "Clean",
          paths:     w.paths ?? [],
        })),
      }, null, 2),
    }],
  };
}
