export type TeamIdentity = {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  conference: "Eastern" | "Western";
  division: string;
  palette: {
    primary: string;
    secondary: string;
  };
  competitiveWindow: string;
  needs: string[];
};

export type MockAsset = {
  id: string;
  teamId: string;
  bucket: "nhl" | "ahl" | "prospect" | "pick";
  name: string;
  type: "Forward" | "Defense" | "Goalie" | "DraftPick";
  role: string;
  position: "C" | "LW" | "RW" | "D" | "G" | "P";
  age: number;
  contractLabel: string;
  capHit: number;
  baseCapHit: number;
  term: number;
  currentWar: number | null;
  futureWar: number;
  valueScore: number;
  risk: number;
  shootingHand: "L" | "R";
  summary: string;
  clauseType?: "NMC" | "NTC" | "M-NTC" | null;
  clauseDetail?: string | null;
  isTradeBlocked?: boolean;
  retainedCapHit?: number;
  countsAgainstCap?: boolean;
  hasExtension?: boolean;
};

export type MockTeam = TeamIdentity & {
  assets: MockAsset[];
};

export const SALARY_CAP_CEILING = 95.5;

const teamIdentities: TeamIdentity[] = [
  {
    id: "anaheim-ducks",
    name: "Anaheim Ducks",
    shortName: "Ducks",
    abbreviation: "ANA",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#9d9fa3", secondary: "#f2f3f5" },
    competitiveWindow: "Young core still climbing toward the wild card line.",
    needs: ["right-shot defense", "middle-six scoring", "power-play structure"]
  },
  {
    id: "boston-bruins",
    name: "Boston Bruins",
    shortName: "Bruins",
    abbreviation: "BOS",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#9ea4ac", secondary: "#f4f7fa" },
    competitiveWindow: "Trying to stay dangerous while the roster gets older.",
    needs: ["transition defense", "wing scoring", "younger legs"]
  },
  {
    id: "buffalo-sabres",
    name: "Buffalo Sabres",
    shortName: "Sabres",
    abbreviation: "BUF",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#8792a4", secondary: "#eef3f9" },
    competitiveWindow: "Pushing to turn talent into a playoff-caliber group.",
    needs: ["defensive structure", "crease stability", "playoff-ready depth"]
  },
  {
    id: "calgary-flames",
    name: "Calgary Flames",
    shortName: "Flames",
    abbreviation: "CGY",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#8e9199", secondary: "#f0f3f5" },
    competitiveWindow: "Balancing a quick reset with pressure to stay competitive.",
    needs: ["top-six playmaking", "young puck movers", "longer-term cap flexibility"]
  },
  {
    id: "carolina-hurricanes",
    name: "Carolina Hurricanes",
    shortName: "Hurricanes",
    abbreviation: "CAR",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#9da5b1", secondary: "#f6f8fb" },
    competitiveWindow: "Firmly in win-now mode with room for one more splash.",
    needs: ["finishing touch", "net-front scoring", "cheap bottom-six speed"]
  },
  {
    id: "chicago-blackhawks",
    name: "Chicago Blackhawks",
    shortName: "Blackhawks",
    abbreviation: "CHI",
    conference: "Western",
    division: "Central",
    palette: { primary: "#8b96a4", secondary: "#eef2f5" },
    competitiveWindow: "Building around a young star and collecting support pieces.",
    needs: ["two-way wingers", "NHL-ready defense", "veteran insulation"]
  },
  {
    id: "colorado-avalanche",
    name: "Colorado Avalanche",
    shortName: "Avalanche",
    abbreviation: "COL",
    conference: "Western",
    division: "Central",
    palette: { primary: "#8f98aa", secondary: "#f4f7fb" },
    competitiveWindow: "Still attacking the Cup window aggressively.",
    needs: ["cheap scoring depth", "third-pair stability", "future cap relief"]
  },
  {
    id: "columbus-blue-jackets",
    name: "Columbus Blue Jackets",
    shortName: "Blue Jackets",
    abbreviation: "CBJ",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#8898af", secondary: "#eef4fa" },
    competitiveWindow: "Young roster looking for credible structure and upside.",
    needs: ["top-four defense", "penalty kill help", "veteran center support"]
  },
  {
    id: "dallas-stars",
    name: "Dallas Stars",
    shortName: "Stars",
    abbreviation: "DAL",
    conference: "Western",
    division: "Central",
    palette: { primary: "#8a9a92", secondary: "#eff5f2" },
    competitiveWindow: "Contending now while preserving one more wave of youth.",
    needs: ["right-side depth", "cost-controlled scoring", "back-end mobility"]
  },
  {
    id: "detroit-red-wings",
    name: "Detroit Red Wings",
    shortName: "Red Wings",
    abbreviation: "DET",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#979ba4", secondary: "#f2f5f8" },
    competitiveWindow: "Trying to turn patient growth into postseason hockey.",
    needs: ["top-line driver", "blue-line offense", "late-game finishing"]
  },
  {
    id: "edmonton-oilers",
    name: "Edmonton Oilers",
    shortName: "Oilers",
    abbreviation: "EDM",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#8d97a8", secondary: "#f3f6fb" },
    competitiveWindow: "Deep in the contender window and chasing extra margins.",
    needs: ["shutdown defense", "cheap goaltending insulation", "secondary scoring"]
  },
  {
    id: "florida-panthers",
    name: "Florida Panthers",
    shortName: "Panthers",
    abbreviation: "FLA",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#97a0ac", secondary: "#f3f6f9" },
    competitiveWindow: "Built to push for another long spring run.",
    needs: ["puck retrieval", "middle-pair depth", "future pick replenishment"]
  },
  {
    id: "los-angeles-kings",
    name: "Los Angeles Kings",
    shortName: "Kings",
    abbreviation: "LAK",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#9ea7b3", secondary: "#f5f7fa" },
    competitiveWindow: "Trying to upgrade skill without losing structure.",
    needs: ["transition speed", "top-six scoring", "more offensive defense"]
  },
  {
    id: "minnesota-wild",
    name: "Minnesota Wild",
    shortName: "Wild",
    abbreviation: "MIN",
    conference: "Western",
    division: "Central",
    palette: { primary: "#87958e", secondary: "#eef3f0" },
    competitiveWindow: "Competitive now, but looking for a stronger finishing punch.",
    needs: ["shot creation", "right-shot defense", "cheap impact contracts"]
  },
  {
    id: "montreal-canadiens",
    name: "Montreal Canadiens",
    shortName: "Canadiens",
    abbreviation: "MTL",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#939daa", secondary: "#eff4f9" },
    competitiveWindow: "Still in build mode with selective opportunities to accelerate.",
    needs: ["middle-six experience", "defensive zone exits", "right-side depth"]
  },
  {
    id: "nashville-predators",
    name: "Nashville Predators",
    shortName: "Predators",
    abbreviation: "NSH",
    conference: "Western",
    division: "Central",
    palette: { primary: "#9da4ad", secondary: "#f5f7f9" },
    competitiveWindow: "Trying to stay dangerous while refreshing key spots.",
    needs: ["play-driving wing", "future assets", "speed through the lineup"]
  },
  {
    id: "new-jersey-devils",
    name: "New Jersey Devils",
    shortName: "Devils",
    abbreviation: "NJD",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#919aa6", secondary: "#f2f5f7" },
    competitiveWindow: "Entering an aggressive growth phase around a fast core.",
    needs: ["crease help", "stay-home defense", "playoff heaviness"]
  },
  {
    id: "new-york-islanders",
    name: "New York Islanders",
    shortName: "Islanders",
    abbreviation: "NYI",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#8494a9", secondary: "#eef4fa" },
    competitiveWindow: "Trying to squeeze one more run from an experienced group.",
    needs: ["offensive lift", "cheaper depth", "transition support"]
  },
  {
    id: "new-york-rangers",
    name: "New York Rangers",
    shortName: "Rangers",
    abbreviation: "NYR",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#8a96a6", secondary: "#f0f4f8" },
    competitiveWindow: "Cup push mode with pressure to optimize every lineup slot.",
    needs: ["five-on-five scoring", "third-pair mobility", "cheap two-way wings"]
  },
  {
    id: "ottawa-senators",
    name: "Ottawa Senators",
    shortName: "Senators",
    abbreviation: "OTT",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#919ca8", secondary: "#f2f5f7" },
    competitiveWindow: "Trying to translate talent into steadier results.",
    needs: ["defensive balance", "veteran calm", "play-driving wing support"]
  },
  {
    id: "philadelphia-flyers",
    name: "Philadelphia Flyers",
    shortName: "Flyers",
    abbreviation: "PHI",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#989ea7", secondary: "#f6f7f8" },
    competitiveWindow: "Building identity first, then chasing bigger swings.",
    needs: ["elite skill", "puck-moving defense", "late-game offense"]
  },
  {
    id: "pittsburgh-penguins",
    name: "Pittsburgh Penguins",
    shortName: "Penguins",
    abbreviation: "PIT",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#a1a7af", secondary: "#f7f8fa" },
    competitiveWindow: "Managing an aging core without conceding the present.",
    needs: ["younger speed", "future picks", "defensive detail"]
  },
  {
    id: "san-jose-sharks",
    name: "San Jose Sharks",
    shortName: "Sharks",
    abbreviation: "SJS",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#7e96a1", secondary: "#ecf3f6" },
    competitiveWindow: "Longer rebuild focused on accumulating upside.",
    needs: ["premium picks", "center depth", "prospect insulation"]
  },
  {
    id: "seattle-kraken",
    name: "Seattle Kraken",
    shortName: "Kraken",
    abbreviation: "SEA",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#8494a6", secondary: "#eef3f8" },
    competitiveWindow: "Searching for more top-end offense without losing depth.",
    needs: ["dynamic creator", "power-play help", "high-end prospect talent"]
  },
  {
    id: "st-louis-blues",
    name: "St. Louis Blues",
    shortName: "Blues",
    abbreviation: "STL",
    conference: "Western",
    division: "Central",
    palette: { primary: "#8694a6", secondary: "#eff3f8" },
    competitiveWindow: "Re-tooling on the fly with an eye on flexibility.",
    needs: ["pace", "right-side defense", "next-wave scoring"]
  },
  {
    id: "tampa-bay-lightning",
    name: "Tampa Bay Lightning",
    shortName: "Lightning",
    abbreviation: "TBL",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#8093aa", secondary: "#eef3f9" },
    competitiveWindow: "Still chasing banners while threading cap pressure.",
    needs: ["cheap value", "forecheck pressure", "third-line scoring"]
  },
  {
    id: "toronto-maple-leafs",
    name: "Toronto Maple Leafs",
    shortName: "Maple Leafs",
    abbreviation: "TOR",
    conference: "Eastern",
    division: "Atlantic",
    palette: { primary: "#8c9aac", secondary: "#f2f6fb" },
    competitiveWindow: "Built to contend, but under pressure to improve playoff translation.",
    needs: ["playoff-style defense", "value contracts", "net-front finishing"]
  },
  {
    id: "utah-hockey-club",
    name: "Utah Hockey Club",
    shortName: "Utah",
    abbreviation: "UTA",
    conference: "Western",
    division: "Central",
    palette: { primary: "#979d9e", secondary: "#f4f5f5" },
    competitiveWindow: "Young group still assembling its long-term identity.",
    needs: ["top-six creation", "NHL-ready defense", "veteran depth"]
  },
  {
    id: "vancouver-canucks",
    name: "Vancouver Canucks",
    shortName: "Canucks",
    abbreviation: "VAN",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#8398a0", secondary: "#eef4f5" },
    competitiveWindow: "Trying to stay in the upper tier with better balance.",
    needs: ["cost certainty", "penalty kill help", "power-forward depth"]
  },
  {
    id: "vegas-golden-knights",
    name: "Vegas Golden Knights",
    shortName: "Golden Knights",
    abbreviation: "VGK",
    conference: "Western",
    division: "Pacific",
    palette: { primary: "#b8c0cb", secondary: "#ffffff" },
    competitiveWindow: "Always pushing the table in while the core can contend.",
    needs: ["future assets", "cheap impact wings", "blue-line succession"]
  },
  {
    id: "washington-capitals",
    name: "Washington Capitals",
    shortName: "Capitals",
    abbreviation: "WSH",
    conference: "Eastern",
    division: "Metropolitan",
    palette: { primary: "#949ba6", secondary: "#f0f4f7" },
    competitiveWindow: "Blending legacy stars with a need to get younger quickly.",
    needs: ["middle-six pace", "future scoring", "cheap defenders"]
  },
  {
    id: "winnipeg-jets",
    name: "Winnipeg Jets",
    shortName: "Jets",
    abbreviation: "WPG",
    conference: "Western",
    division: "Central",
    palette: { primary: "#8596ac", secondary: "#eff4fa" },
    competitiveWindow: "Trying to maximize the current group before decisions stack up.",
    needs: ["playoff scoring", "third-pair depth", "cap flexibility"]
  }
];

const forwardFirstNames = ["Nico", "Soren", "Marek", "Elias", "Tomas", "Jalen", "Milan", "Arvid", "Roman", "Kasper", "Noah", "Viktor", "Luca", "Ryder"];
const forwardLastNames = ["Halberg", "Drake", "Mirov", "Santini", "Kovacs", "Berger", "Rossi", "Leduc", "Koivula", "Merritt", "Guerin", "Salo", "Madden", "Cerrone"];
const defenseFirstNames = ["Luka", "Jonas", "Anton", "Declan", "Matias", "Henrik", "Pavel", "Noel", "Rasmus", "Owen"];
const defenseLastNames = ["Vester", "Kline", "Morrow", "Daneault", "Saarinen", "Larsen", "Kade", "Bellerose", "Holt", "Cerrato"];
const goalieFirstNames = ["Ilya", "Joel", "Mika", "Devon", "Cal", "Levi"];
const goalieLastNames = ["Ranta", "Sten", "Bishop", "Mercier", "Dufour", "Soder"];

function makeName(index: number, firstNames: string[], lastNames: string[], offset = 0) {
  return `${firstNames[(index + offset) % firstNames.length]} ${lastNames[(index * 2 + offset) % lastNames.length]}`;
}

function createForward(team: TeamIdentity, teamIndex: number, slotIndex: number): MockAsset {
  const positions: Array<"C" | "LW" | "RW"> = ["C", "LW", "RW", "C", "LW", "RW", "C", "LW", "RW", "C", "LW", "RW", "C"];
  const position = positions[slotIndex];
  const topNine = slotIndex < 9;
  const age = 22 + ((teamIndex + slotIndex) % 9);
  const capHit = Number(
    (
      topNine
        ? 6.8 - slotIndex * 0.36 + (teamIndex % 4) * 0.1
        : 1.35 + (slotIndex % 4) * 0.24
    ).toFixed(2)
  );
  const term = topNine ? 2 + ((teamIndex + slotIndex) % 5) : 1 + ((teamIndex + slotIndex) % 3);
  const currentWar = Number((topNine ? 2.1 - slotIndex * 0.12 : 0.55 - (slotIndex - 9) * 0.05).toFixed(1));
  const futureWar = Number((currentWar + 0.3 + ((slotIndex + teamIndex) % 3) * 0.2).toFixed(1));

  return {
    id: `${team.id}-f-${slotIndex + 1}`,
    teamId: team.id,
    bucket: "nhl",
    name: makeName(teamIndex + slotIndex, forwardFirstNames, forwardLastNames, slotIndex),
    type: "Forward",
    role: topNine ? "Scoring forward" : "Depth forward",
    position,
    age,
    contractLabel: `${term} yr at $${capHit.toFixed(2)}M`,
    capHit,
    baseCapHit: capHit,
    term,
    currentWar,
    futureWar,
    valueScore: Math.max(28, Math.round(capHit * 7 + futureWar * 14 - slotIndex)),
    risk: 16 + ((slotIndex + teamIndex) % 6) * 6,
    shootingHand: slotIndex % 2 === 0 ? "L" : "R",
    summary: `${team.shortName} use this ${position} for ${topNine ? "play-driving offense" : "depth support"} and matchup flexibility.`,
    clauseType: null,
    clauseDetail: null,
    isTradeBlocked: false,
    retainedCapHit: 0,
    countsAgainstCap: true,
    hasExtension: false
  };
}

function createDefense(team: TeamIdentity, teamIndex: number, slotIndex: number): MockAsset {
  const age = 23 + ((teamIndex + slotIndex) % 10);
  const topFour = slotIndex < 4;
  const capHit = Number(
    (
      topFour
        ? 6.45 - slotIndex * 0.48 + (teamIndex % 3) * 0.12
        : 1.3 + (slotIndex % 3) * 0.22
    ).toFixed(2)
  );
  const term = topFour ? 2 + ((teamIndex + slotIndex) % 4) : 1 + ((teamIndex + slotIndex) % 2);
  const currentWar = Number((topFour ? 1.9 - slotIndex * 0.18 : 0.6 - (slotIndex - 4) * 0.08).toFixed(1));
  const futureWar = Number((currentWar + 0.2 + ((slotIndex + teamIndex) % 2) * 0.25).toFixed(1));

  return {
    id: `${team.id}-d-${slotIndex + 1}`,
    teamId: team.id,
    bucket: "nhl",
    name: makeName(teamIndex + slotIndex, defenseFirstNames, defenseLastNames, slotIndex),
    type: "Defense",
    role: topFour ? "Top-four defenseman" : "Depth defenseman",
    position: "D",
    age,
    contractLabel: `${term} yr at $${capHit.toFixed(2)}M`,
    capHit,
    baseCapHit: capHit,
    term,
    currentWar,
    futureWar,
    valueScore: Math.max(24, Math.round(capHit * 7 + futureWar * 13 - slotIndex)),
    risk: 14 + ((slotIndex + teamIndex) % 5) * 5,
    shootingHand: slotIndex % 3 === 0 ? "R" : "L",
    summary: `${team.shortName} rely on this defender for ${topFour ? "top-four minutes and exits" : "depth coverage and penalty kill work"}.`,
    clauseType: null,
    clauseDetail: null,
    isTradeBlocked: false,
    retainedCapHit: 0,
    countsAgainstCap: true,
    hasExtension: false
  };
}

function createGoalie(team: TeamIdentity, teamIndex: number, slotIndex: number): MockAsset {
  const starter = slotIndex === 0;
  const age = 25 + ((teamIndex + slotIndex) % 8);
  const capHit = Number(
    (starter ? 6.9 + (teamIndex % 3) * 0.22 : 2.05 + (teamIndex % 2) * 0.18).toFixed(2)
  );
  const term = starter ? 3 + (teamIndex % 3) : 1 + (teamIndex % 2);
  const currentWar = Number((starter ? 1.7 + (teamIndex % 3) * 0.1 : 0.5 + (teamIndex % 2) * 0.1).toFixed(1));
  const futureWar = Number((currentWar + (starter ? 0.2 : 0.1)).toFixed(1));

  return {
    id: `${team.id}-g-${slotIndex + 1}`,
    teamId: team.id,
    bucket: "nhl",
    name: makeName(teamIndex + slotIndex, goalieFirstNames, goalieLastNames, slotIndex),
    type: "Goalie",
    role: starter ? "Starting goalie" : "Backup goalie",
    position: "G",
    age,
    contractLabel: `${term} yr at $${capHit.toFixed(2)}M`,
    capHit,
    baseCapHit: capHit,
    term,
    currentWar,
    futureWar,
    valueScore: Math.max(22, Math.round(capHit * 6 + futureWar * 15)),
    risk: starter ? 24 + (teamIndex % 3) * 5 : 30 + (teamIndex % 3) * 6,
    shootingHand: "L",
    summary: `${team.shortName} see this goalie as ${starter ? "their main crease option" : "the relief option behind the starter"}.`,
    clauseType: null,
    clauseDetail: null,
    isTradeBlocked: false,
    retainedCapHit: 0,
    countsAgainstCap: true,
    hasExtension: false
  };
}

function createAssets(team: TeamIdentity, index: number): MockAsset[] {
  const forwards = Array.from({ length: 13 }, (_, slotIndex) => createForward(team, index, slotIndex));
  const defense = Array.from({ length: 7 }, (_, slotIndex) => createDefense(team, index, slotIndex));
  const goalies = Array.from({ length: 2 }, (_, slotIndex) => createGoalie(team, index, slotIndex));
  return [...forwards, ...defense, ...goalies];
}

export const mockTeams: MockTeam[] = teamIdentities.map((team) => ({
  ...team,
  assets: []
}));

export function getTeamById(teamId: string) {
  return mockTeams.find((team) => team.id === teamId);
}

export const vgkTeamId = "vegas-golden-knights";
