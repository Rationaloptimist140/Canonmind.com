// ── CANONMIND SEALED KNOWLEDGE BASE ──────────────────────────────────────────
// Static export of cmqs8ogt107yl07ads5pr3whq · 60 entries · Phase 05 sealed
// DO NOT MODIFY directly. All changes require formal CanonGuardian batch review.

export interface KBWork {
  title: string;
  creator: string;
  year: string;
  medium: "film" | "music" | "literature" | "visual-art";
  score: number;
  timelessness: number;
  status: string;
  rule06?: boolean;
  onramp?: string;
  maturity?: string;
  paths?: number[];
}

export const KB: KBWork[] = [
  // ── FILM (18) ──────────────────────────────────────────────────────────────
  { title:"The Godfather", creator:"Francis Ford Coppola", year:"1972", medium:"film", score:9.7, timelessness:10, status:"INTEGRATE", paths:[2] },
  { title:"Seven Samurai", creator:"Akira Kurosawa", year:"1954", medium:"film", score:9.7, timelessness:10, status:"INTEGRATE" },
  { title:"La Règle du jeu", creator:"Jean Renoir", year:"1939", medium:"film", score:9.5, timelessness:10, status:"INTEGRATE" },
  { title:"Tokyo Story", creator:"Yasujirō Ozu", year:"1953", medium:"film", score:9.4, timelessness:10, status:"INTEGRATE", paths:[1] },
  { title:"Wild Strawberries", creator:"Ingmar Bergman", year:"1957", medium:"film", score:9.4, timelessness:10, status:"INTEGRATE" },
  { title:"Apocalypse Now", creator:"Francis Ford Coppola", year:"1979", medium:"film", score:9.3, timelessness:10, status:"INTEGRATE", maturity:"18+" },
  { title:"2001: A Space Odyssey", creator:"Stanley Kubrick", year:"1968", medium:"film", score:9.3, timelessness:10, status:"INTEGRATE", paths:[5] },
  { title:"Citizen Kane", creator:"Orson Welles", year:"1941", medium:"film", score:9.2, timelessness:10, status:"INTEGRATE", paths:[1] },
  { title:"Vertigo", creator:"Alfred Hitchcock", year:"1958", medium:"film", score:9.2, timelessness:10, status:"INTEGRATE", paths:[5,6] },
  { title:"Rashomon", creator:"Akira Kurosawa", year:"1950", medium:"film", score:9.2, timelessness:10, status:"INTEGRATE", paths:[1] },
  { title:"Bicycle Thieves", creator:"Vittorio De Sica", year:"1948", medium:"film", score:9.1, timelessness:10, status:"INTEGRATE" },
  { title:"Stalker", creator:"Andrei Tarkovsky", year:"1979", medium:"film", score:9.0, timelessness:10, status:"INTEGRATE", rule06:true, onramp:"Path 05 required", maturity:"16+" },
  { title:"Andrei Rublev", creator:"Andrei Tarkovsky", year:"1966", medium:"film", score:9.1, timelessness:10, status:"INTEGRATE", rule06:true, onramp:"Watch Stalker first", maturity:"16+" },
  { title:"Persona", creator:"Ingmar Bergman", year:"1966", medium:"film", score:9.1, timelessness:10, status:"INTEGRATE", rule06:true, onramp:"Wild Strawberries first", maturity:"16+" },
  { title:"À bout de souffle", creator:"Jean-Luc Godard", year:"1960", medium:"film", score:9.0, timelessness:10, status:"INTEGRATE" },
  { title:"8½", creator:"Federico Fellini", year:"1963", medium:"film", score:9.0, timelessness:10, status:"INTEGRATE" },
  { title:"The Mirror", creator:"Andrei Tarkovsky", year:"1975", medium:"film", score:8.4, timelessness:9, status:"INTEGRATE", rule06:true, onramp:"Andrei Rublev required", maturity:"16+" },
  { title:"Au Hasard Balthazar", creator:"Robert Bresson", year:"1966", medium:"film", score:9.1, timelessness:10, status:"INTEGRATE", rule06:true, onramp:"Bicycle Thieves required", maturity:"16+" },
  // ── MUSIC (15) ─────────────────────────────────────────────────────────────
  { title:"Symphony No. 9 in D minor", creator:"Ludwig van Beethoven", year:"1824", medium:"music", score:9.7, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"Kind of Blue", creator:"Miles Davis", year:"1959", medium:"music", score:9.7, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"The Well-Tempered Clavier, Book I", creator:"J.S. Bach", year:"1722", medium:"music", score:9.6, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"Symphony No. 5, Op. 47", creator:"Dmitri Shostakovich", year:"1937", medium:"music", score:9.6, timelessness:10, status:"INTEGRATE" },
  { title:"String Quartet Op. 131", creator:"Ludwig van Beethoven", year:"1826", medium:"music", score:9.5, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"The Rite of Spring", creator:"Igor Stravinsky", year:"1913", medium:"music", score:9.4, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"Winterreise", creator:"Franz Schubert", year:"1828", medium:"music", score:9.3, timelessness:10, status:"INTEGRATE", paths:[3,6] },
  { title:"Tristan und Isolde", creator:"Richard Wagner", year:"1865", medium:"music", score:9.3, timelessness:10, status:"INTEGRATE", paths:[6] },
  { title:"Don Giovanni", creator:"Wolfgang Amadeus Mozart", year:"1787", medium:"music", score:9.3, timelessness:10, status:"INTEGRATE" },
  { title:"What's Going On", creator:"Marvin Gaye", year:"1971", medium:"music", score:9.2, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"A Love Supreme", creator:"John Coltrane", year:"1965", medium:"music", score:9.2, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"Highway 61 Revisited", creator:"Bob Dylan", year:"1965", medium:"music", score:9.1, timelessness:10, status:"INTEGRATE" },
  { title:"Revolver", creator:"The Beatles", year:"1966", medium:"music", score:9.1, timelessness:10, status:"INTEGRATE", paths:[3] },
  { title:"Ellington at Newport", creator:"Duke Ellington", year:"1956", medium:"music", score:9.1, timelessness:10, status:"INTEGRATE", paths:[3] },
  // ── LITERATURE (16) ────────────────────────────────────────────────────────
  { title:"Hamlet", creator:"William Shakespeare", year:"c. 1601", medium:"literature", score:9.6, timelessness:10, status:"INTEGRATE", paths:[1,2] },
  { title:"The Odyssey", creator:"Homer", year:"c. 8th century BCE", medium:"literature", score:9.5, timelessness:10, status:"INTEGRATE", paths:[1,4] },
  { title:"The Metamorphosis", creator:"Franz Kafka", year:"1915", medium:"literature", score:9.9, timelessness:10, status:"INTEGRATE" },
  { title:"Anna Karenina", creator:"Leo Tolstoy", year:"1878", medium:"literature", score:9.4, timelessness:10, status:"INTEGRATE", paths:[1,6] },
  { title:"Oedipus Rex", creator:"Sophocles", year:"c. 429 BCE", medium:"literature", score:9.4, timelessness:10, status:"INTEGRATE", paths:[2] },
  { title:"Madame Bovary", creator:"Gustave Flaubert", year:"1857", medium:"literature", score:9.4, timelessness:10, status:"INTEGRATE" },
  { title:"Things Fall Apart", creator:"Chinua Achebe", year:"1958", medium:"literature", score:9.4, timelessness:9, status:"INTEGRATE" },
  { title:"The Brothers Karamazov", creator:"Fyodor Dostoevsky", year:"1880", medium:"literature", score:9.3, timelessness:10, status:"INTEGRATE", paths:[2,4] },
  { title:"Don Quixote", creator:"Miguel de Cervantes", year:"1605", medium:"literature", score:9.3, timelessness:10, status:"INTEGRATE", paths:[2,4] },
  { title:"The Divine Comedy", creator:"Dante Alighieri", year:"c. 1320", medium:"literature", score:9.3, timelessness:10, status:"INTEGRATE", paths:[4] },
  { title:"Crime and Punishment", creator:"Fyodor Dostoevsky", year:"1866", medium:"literature", score:9.3, timelessness:10, status:"INTEGRATE", paths:[2] },
  { title:"One Hundred Years of Solitude", creator:"Gabriel García Márquez", year:"1967", medium:"literature", score:9.2, timelessness:10, status:"INTEGRATE", paths:[4,5] },
  { title:"Pride and Prejudice", creator:"Jane Austen", year:"1813", medium:"literature", score:9.2, timelessness:10, status:"INTEGRATE", paths:[4] },
  { title:"The Trial", creator:"Franz Kafka", year:"1925", medium:"literature", score:9.2, timelessness:10, status:"INTEGRATE", paths:[5] },
  { title:"Ulysses", creator:"James Joyce", year:"1922", medium:"literature", score:9.1, timelessness:10, status:"INTEGRATE" },
  { title:"Mrs Dalloway", creator:"Virginia Woolf", year:"1925", medium:"literature", score:9.0, timelessness:10, status:"INTEGRATE", paths:[1,6] },
  // ── VISUAL ART (11) ────────────────────────────────────────────────────────
  { title:"Sistine Chapel Ceiling", creator:"Michelangelo", year:"1508–1512", medium:"visual-art", score:9.6, timelessness:10, status:"INTEGRATE" },
  { title:"Las Meninas", creator:"Diego Velázquez", year:"1656", medium:"visual-art", score:9.5, timelessness:10, status:"INTEGRATE" },
  { title:"The Last Supper", creator:"Leonardo da Vinci", year:"c. 1495–1498", medium:"visual-art", score:9.5, timelessness:10, status:"INTEGRATE" },
  { title:"The Night Watch", creator:"Rembrandt van Rijn", year:"1642", medium:"visual-art", score:9.7, timelessness:10, status:"INTEGRATE" },
  { title:"Guernica", creator:"Pablo Picasso", year:"1937", medium:"visual-art", score:9.4, timelessness:10, status:"INTEGRATE", paths:[2] },
  { title:"The Third of May 1808", creator:"Francisco Goya", year:"1814", medium:"visual-art", score:9.3, timelessness:10, status:"INTEGRATE" },
  { title:"The Great Wave off Kanagawa", creator:"Katsushika Hokusai", year:"c. 1831", medium:"visual-art", score:9.2, timelessness:10, status:"INTEGRATE" },
  { title:"The Starry Night", creator:"Vincent van Gogh", year:"1889", medium:"visual-art", score:9.2, timelessness:10, status:"INTEGRATE" },
  { title:"Nighthawks", creator:"Edward Hopper", year:"1942", medium:"visual-art", score:9.2, timelessness:10, status:"INTEGRATE" },
  { title:"Girl with a Pearl Earring", creator:"Johannes Vermeer", year:"c. 1665", medium:"visual-art", score:9.3, timelessness:10, status:"INTEGRATE" },
  { title:"The Card Players", creator:"Paul Cézanne", year:"1890–1895", medium:"visual-art", score:9.1, timelessness:10, status:"INTEGRATE" },
];

export const KB_BY_TITLE = new Map<string, KBWork>(
  KB.map(w => [w.title.toLowerCase(), w])
);

export function findWork(query: string): KBWork | undefined {
  const q = query.toLowerCase().trim();
  return KB_BY_TITLE.get(q) ??
    KB.find(w => w.title.toLowerCase().includes(q)) ??
    KB.find(w => w.creator.toLowerCase().includes(q));
}
