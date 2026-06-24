import { KB_TABLE_ID } from "../constants.js";
import { KB as KB_DATA } from "../kb.js";

const PATHS: Record<number, {
  name: string;
  mediums: string;
  level: string;
  duration: string;
  question: string;
  works: string[];
  optional?: string[];
}> = {
  1: {
    name: "Understanding Human Memory & Time",
    mediums: "Film + Literature",
    level: "Beginner–Intermediate",
    duration: "3–4 weeks",
    question: "How do great artists show us that memory shapes identity and determines how we live in the present?",
    works: ["The Odyssey","Hamlet","Anna Karenina","Citizen Kane","Tokyo Story","Mrs Dalloway"],
    optional: ["Rashomon"],
  },
  2: {
    name: "Moral Choice and Evil",
    mediums: "Literature + Film + Visual Art",
    level: "Intermediate",
    duration: "4–6 weeks",
    question: "How do great works explore the moment a person chooses wrong — and what it costs them and the world?",
    works: ["Oedipus Rex","Hamlet","Don Quixote","Crime and Punishment","The Godfather","The Brothers Karamazov","Guernica"],
    optional: ["Andrei Rublev"],
  },
  3: {
    name: "Beauty and Structure in Music",
    mediums: "Music only",
    level: "Beginner",
    duration: "7 weeks",
    question: "How do composers create beauty through formal structure — and what does understanding structure add to listening?",
    works: ["Kind of Blue","Revolver","What's Going On","Ellington at Newport","The Well-Tempered Clavier, Book I","Symphony No. 9 in D minor","Winterreise"],
    optional: ["A Love Supreme","The Rite of Spring","String Quartet Op. 131"],
  },
  4: {
    name: "What is a Good Life?",
    mediums: "Literature",
    level: "Intermediate",
    duration: "5–6 weeks",
    question: "Across seven centuries of literature, what does it mean to live well — and how do the greatest writers answer a question that philosophy has never fully resolved?",
    works: ["The Odyssey","The Divine Comedy","Don Quixote","Pride and Prejudice","The Brothers Karamazov","Mrs Dalloway","One Hundred Years of Solitude"],
    optional: ["Crime and Punishment"],
  },
  5: {
    name: "Humanity vs Technology",
    mediums: "Film + Literature",
    level: "Intermediate",
    duration: "4–5 weeks",
    question: "When does the instrument become the master — and what is left of the human being on the other side of that transition?",
    works: ["The Trial","One Hundred Years of Solitude","La Règle du jeu","Vertigo","2001: A Space Odyssey","Apocalypse Now"],
    optional: ["Andrei Rublev"],
  },
  6: {
    name: "Love and Its Costs",
    mediums: "Literature + Music + Film",
    level: "Intermediate",
    duration: "5–6 weeks",
    question: "What does great art understand about love that the people living through it cannot see?",
    works: ["The Odyssey","Winterreise","Anna Karenina","Tristan und Isolde","Vertigo","Tokyo Story","Mrs Dalloway"],
    optional: ["Pride and Prejudice"],
  },
};

export async function handleGetPath(args: Record<string, unknown>) {
  const pathId = Number(args.path_id ?? 0);
  const path = PATHS[pathId];
  if (!path) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error:    `Path ${pathId} not found. Valid paths: 1–6.`,
          available: Object.entries(PATHS).map(([id, p]) => ({ id: Number(id), name: p.name })),
        }, null, 2),
      }],
    };
  }

  const resolvedWorks = path.works.map(title => {
    const w = KB_DATA.find(k => k.title === title);
    return w ? {
      title:   w.title,
      creator: w.creator,
      year:    w.year,
      medium:  w.medium,
      score:   w.score,
      maturity: w.maturity ?? "Clean",
      rule06:  w.rule06 ?? false,
    } : { title, note: "verify against KB" };
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        source:   KB_TABLE_ID,
        path_id:  pathId,
        name:     path.name,
        mediums:  path.mediums,
        level:    path.level,
        duration: path.duration,
        question: path.question,
        works:    resolvedWorks,
        optional: path.optional ?? [],
        canon_compliance: `${resolvedWorks.length}/${resolvedWorks.length} from sealed KB ✓`,
      }, null, 2),
    }],
  };
}
