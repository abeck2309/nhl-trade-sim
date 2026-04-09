import { mockTeams, type MockAsset, type MockTeam } from "@/lib/mock-trade-sim";
import { getMetricKey, getPlayerMetricData } from "@/lib/player-metrics";

type CapWagesContractDetail = {
  season?: string;
  capHit?: string;
  aav?: string;
  clause?: string;
  retention?: Record<string, { capHit?: string; retention?: string }>;
};

type CapWagesContract = {
  expiryStatus?: string;
  type?: string;
  details?: CapWagesContractDetail[];
};

type CapWagesPlayer = {
  name?: string;
  terms?: string;
  termsDetails?: string;
  status?: string;
  pos?: string;
  born?: string;
  currentTeam?: string;
  contracts?: CapWagesContract[];
};

type CapWagesDraftPick = {
  year?: number;
  round?: number;
  team?: string;
  conditions?: unknown;
  isTradedAway?: boolean;
};

type CapWagesPageProps = {
  data?: {
    roster?: Record<string, CapWagesPlayer[]>;
    "non-roster"?: Record<string, CapWagesPlayer[]>;
  };
  reserves?: CapWagesPlayer[];
  draftPicks?: CapWagesDraftPick[];
};

type SectionCapOverride = {
  section: string;
  capHit: number;
};

const REQUEST_DELAY_MS = 120;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeAssetName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatCapWagesName(name?: string) {
  if (!name) return "";
  if (!name.includes(",")) return name.trim();

  const [lastName, ...firstParts] = name.split(",");
  return `${firstParts.join(",").trim()} ${lastName.trim()}`.trim();
}

function parseMoneyToNumber(value?: string) {
  if (!value) return null;
  const numeric = Number(value.replace(/[$,]/g, ""));
  return Number.isFinite(numeric) ? Math.round((numeric / 1_000_000) * 100) / 100 : null;
}

function getCurrentSeasonStartYear() {
  const now = new Date();
  return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

function parseSeasonStart(season?: string) {
  if (!season) return null;
  const match = season.match(/^(\d{4})-/);
  return match ? Number(match[1]) : null;
}

function extractSectionCapOverrides(html: string) {
  const overrides = new Map<string, SectionCapOverride>();
  const tableRegex = /<table class="teamProfileRosterSection__table[\s\S]*?<\/table>/g;
  const headerRegex = /<th class="text-left px-1">([^<]+)<\/th>/;
  const rowRegex = /<tr class="bg-white[\s\S]*?<\/tr>/g;
  const nameRegex = /href="\/players\/[^"]+">([^<]+)<\/a>/;
  const cellRegex = /<td class="px-1"><div class=" w-full">\$(.*?)<\/div>/;

  for (const table of html.match(tableRegex) ?? []) {
    const headerMatch = table.match(headerRegex);
    const sectionLabel = headerMatch?.[1]?.trim().toLowerCase() ?? "";

    if (!sectionLabel.startsWith("long-term injured reserve")) {
      continue;
    }

    for (const row of table.match(rowRegex) ?? []) {
      const nameMatch = row.match(nameRegex);
      const capMatch = row.match(cellRegex);

      if (!nameMatch || !capMatch) {
        continue;
      }

      const capHit = parseMoneyToNumber(`$${capMatch[1]}`);
      if (capHit === null) {
        continue;
      }

      overrides.set(normalizeAssetName(formatCapWagesName(nameMatch[1])), {
        section: "long-term injured reserve",
        capHit
      });
    }
  }

  return overrides;
}

function ageFromBirthDate(birthDate?: string) {
  if (!birthDate) return 20;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.valueOf())) {
    return 20;
  }

  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }

  return age;
}

function parseCapWagesPosition(pos?: string): MockAsset["position"] {
  const primary = pos?.split(",")[0]?.trim().toUpperCase() ?? "";
  if (primary === "C") return "C";
  if (primary === "RW" || primary === "R") return "RW";
  if (primary === "LW" || primary === "L") return "LW";
  if (primary === "G") return "G";
  if (primary === "RD" || primary === "LD" || primary === "D") return "D";
  return "C";
}

function parseCapWagesKind(pos?: string): Exclude<MockAsset["type"], "DraftPick"> {
  const position = parseCapWagesPosition(pos);
  if (position === "G") return "Goalie";
  if (position === "D") return "Defense";
  return "Forward";
}

function normalizeClauseType(text: string) {
  const normalized = text.toUpperCase();

  if (normalized.includes("M-NTC") || normalized.includes("MODIFIED NTC") || normalized.includes("MODIFIED NO-TRADE")) {
    return "M-NTC" as const;
  }
  if (normalized.includes("NMC") || normalized.includes("NO-MOVE")) {
    return "NMC" as const;
  }
  if (normalized.includes("NTC") || normalized.includes("NO-TRADE")) {
    return "NTC" as const;
  }

  return null;
}

function extractClause(player: CapWagesPlayer) {
  const contract = player.contracts?.find((entry) =>
    (entry.details ?? []).some((detail) => Boolean(detail.capHit || detail.aav))
  );
  const currentDetail = contract?.details?.find((detail) => Boolean(detail.capHit || detail.aav));
  const pieces = [player.terms, player.termsDetails, currentDetail?.clause]
    .filter(Boolean)
    .map((value) => value!.trim());

  const detail = pieces.join(" | ");
  const clauseType = normalizeClauseType(detail);

  return {
    clauseType,
    clauseDetail: clauseType ? detail : null,
    isTradeBlocked: clauseType === "NMC" || clauseType === "NTC"
  };
}

function getCurrentContract(player: CapWagesPlayer) {
  const currentSeasonStart = getCurrentSeasonStartYear();
  const contracts = player.contracts ?? [];
  const contract =
    contracts.find((entry) =>
      (entry.details ?? []).some((detail) => parseSeasonStart(detail.season) === currentSeasonStart)
    ) ??
    contracts.find((entry) =>
      (entry.details ?? []).some((detail) => Boolean(detail.capHit || detail.aav))
    );
  const detail =
    contract?.details?.find((entry) => parseSeasonStart(entry.season) === currentSeasonStart) ??
    contract?.details?.find((entry) => Boolean(entry.capHit || entry.aav));
  const remainingYears = Math.max(
    0,
    (contract?.details ?? []).filter((entry) => {
      const seasonStart = parseSeasonStart(entry.season);
      return Boolean(entry.capHit || entry.aav) && seasonStart !== null && seasonStart >= currentSeasonStart;
    }).length
  );
  const capHit = parseMoneyToNumber(detail?.capHit ?? detail?.aav);
  const contractBits = [player.terms?.trim(), contract?.expiryStatus?.trim() || contract?.type?.trim()]
    .filter(Boolean)
    .join(" | ");
  const hasExtension = contracts.some((entry) => {
    if (entry === contract) {
      return false;
    }

    return (entry.details ?? []).some((detailEntry) => {
      const seasonStart = parseSeasonStart(detailEntry.season);
      return seasonStart !== null && seasonStart > currentSeasonStart;
    });
  });

  return {
    capHit,
    remainingYears,
    detail,
    hasExtension,
    contractLabel:
      capHit === null ? "N/A" : contractBits ? `${contractBits} at $${capHit.toFixed(2)}M` : `$${capHit.toFixed(2)}M`
  };
}

function inferRole(bucket: Extract<MockAsset["bucket"], "nhl" | "ahl" | "prospect">, player: CapWagesPlayer, kind: Exclude<MockAsset["type"], "DraftPick">) {
  if (bucket === "nhl") {
    const status = player.status?.trim();
    return status ? status : `NHL ${kind.toLowerCase()}`;
  }

  if (bucket === "ahl") {
    return `AHL ${kind.toLowerCase()}`;
  }

  return "Prospect rights";
}

function applyKnownCapOverride(team: MockTeam, name: string, capHit: number) {
  return capHit;
}

function getRetainedCapHitForTeam(team: MockTeam, detail?: CapWagesContractDetail) {
  if (!detail?.retention) {
    return null;
  }

  const exactMatch = detail.retention[team.name];
  if (exactMatch?.capHit) {
    return parseMoneyToNumber(exactMatch.capHit);
  }

  const normalizedTeamName = normalizeAssetName(team.name);
  const matchedEntry = Object.entries(detail.retention).find(
    ([retentionTeam]) => normalizeAssetName(retentionTeam) === normalizedTeamName
  );

  return matchedEntry?.[1]?.capHit ? parseMoneyToNumber(matchedEntry[1].capHit) : null;
}

function applyKnownStatusOverride(team: MockTeam, name: string, status?: string) {
  if (team.abbreviation === "VGK" && normalizeAssetName(name) === normalizeAssetName("Alex Pietrangelo")) {
    return "SELTIR";
  }

  return status?.trim();
}

function statusCountsAgainstCap(status?: string) {
  const normalized = status?.trim().toUpperCase() ?? "";

  if (!normalized) {
    return true;
  }

  return !(
    normalized.includes("SEIR") ||
    normalized.includes("SELTIR")
  );
}

function buildPlayerAsset(
  team: MockTeam,
  player: CapWagesPlayer,
  bucket: Extract<MockAsset["bucket"], "nhl" | "ahl" | "prospect">,
  index: number,
  sectionName?: string,
  sectionCapOverrides?: Map<string, SectionCapOverride>,
  metrics?: Awaited<ReturnType<typeof getPlayerMetricData>>
) {
  const kind = parseCapWagesKind(player.pos);
  const position = parseCapWagesPosition(player.pos);
  const name = formatCapWagesName(player.name);
  const contract = getCurrentContract(player);
  const clause = extractClause(player);
  const isProspect = bucket === "prospect";
  const retainedCapOverride = isProspect ? null : getRetainedCapHitForTeam(team, contract.detail);
  const sectionCapOverride = sectionCapOverrides?.get(normalizeAssetName(name));
  const rawCapHit = isProspect ? 0 : sectionCapOverride?.capHit ?? retainedCapOverride ?? contract.capHit ?? 0;
  const capHit = applyKnownCapOverride(team, name, rawCapHit);
  const status = applyKnownStatusOverride(team, name, player.status);
  const countsAgainstCap = bucket === "nhl" ? statusCountsAgainstCap(status) : true;
  const metricKey = getMetricKey(name, team.abbreviation);
  const importedWar = metrics?.warByPlayerTeam.get(metricKey) ?? null;
  const importedScore = metrics?.scoreByPlayerTeam.get(metricKey);
  const fallbackWar =
    kind === "Goalie"
      ? Number(Math.max(0.1, (bucket === "nhl" ? 1.4 : 0.5) - index * (bucket === "nhl" ? 0.08 : 0.03)).toFixed(1))
      : Number(Math.max(0.1, (bucket === "nhl" ? 2 : 0.7) - index * (bucket === "nhl" ? 0.07 : 0.03)).toFixed(1));
  const currentWar = importedWar;
  const futureWar =
    bucket === "prospect"
      ? Number(Math.max(0.3, 1.4 - index * 0.05).toFixed(1))
      : Number((((currentWar ?? fallbackWar) + (bucket === "ahl" ? 0.2 : 0.3))).toFixed(1));

  return {
    id: `${team.id}-${bucket}-${normalizeAssetName(name)}`,
    teamId: team.id,
    bucket,
    name,
    type: kind,
    role:
      bucket === "nhl"
        ? status || `NHL ${kind.toLowerCase()}`
        : inferRole(bucket, player, kind),
    position,
    age: ageFromBirthDate(player.born),
    contractLabel:
      isProspect
        ? "N/A"
        : capHit !== rawCapHit
          ? `${contract.contractLabel} | 50% retained`
          : contract.contractLabel,
    capHit,
    baseCapHit: capHit,
    term: isProspect ? 0 : contract.remainingYears,
    currentWar,
    futureWar,
    valueScore:
      typeof importedScore === "number"
        ? importedScore
        : bucket === "prospect"
        ? Math.max(16, 42 - index)
        : bucket === "ahl"
          ? Math.max(12, Math.round(14 + futureWar * 10 - index))
          : Math.max(14, Math.round((capHit || 0.8) * 5 + (currentWar ?? 0) * 10 - index / 2)),
    risk: bucket === "prospect" ? 42 : bucket === "ahl" ? 28 : 18,
    shootingHand: "L",
    summary:
      bucket === "nhl"
        ? `${team.shortName} currently list this player on their NHL roster in CapWages.`
        : bucket === "ahl"
          ? `${team.shortName} currently list this player in their non-roster or AHL group on CapWages.`
          : `${team.shortName} currently hold the rights to this prospect on CapWages.`,
    clauseType: clause.clauseType,
    clauseDetail: clause.clauseDetail,
    isTradeBlocked: clause.isTradeBlocked,
    retainedCapHit: 0,
    countsAgainstCap,
    hasExtension: contract.hasExtension
  } satisfies MockAsset;
}

function abbreviateTeamName(teamName?: string) {
  if (!teamName) return "Own";

  const matchingTeam = mockTeams.find(
    (team) => normalizeAssetName(team.name) === normalizeAssetName(teamName)
  );

  if (matchingTeam) {
    return matchingTeam.abbreviation;
  }

  const words = teamName.split(/\s+/).filter(Boolean);
  return words.length === 1
    ? words[0].slice(0, 3).toUpperCase()
    : words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
}

function formatDraftConditions(conditions: unknown): string {
  if (typeof conditions === "string") {
    return conditions.trim();
  }

  if (Array.isArray(conditions)) {
    return conditions
      .map((item) => formatDraftConditions(item))
      .filter(Boolean)
      .join(" | ");
  }

  if (conditions && typeof conditions === "object") {
    const text = Object.values(conditions as Record<string, unknown>)
      .map((value) => formatDraftConditions(value))
      .filter(Boolean)
      .join(" | ");
    return text;
  }

  return "";
}

function mapDraftPick(team: MockTeam, pick: CapWagesDraftPick, index: number) {
  const year = pick.year ?? new Date().getUTCFullYear();
  const round = pick.round ?? 1;
  const sourceAbbreviation = abbreviateTeamName(pick.team);
  const conditions = formatDraftConditions(pick.conditions);
  const role = conditions ? `Owned draft pick | ${conditions}` : "Owned draft pick";
  const currentYear = new Date().getUTCFullYear();
  const yearsOut = Math.max(0, year - currentYear);
  const roundDiscount = Math.pow(0.58, Math.max(0, round - 1));
  const yearDiscount = Math.pow(0.72, yearsOut);
  const discountedPickValue = Math.max(4, Math.round(72 * roundDiscount * yearDiscount));
  const discountedFutureWar = Number(Math.max(0.2, 1.7 * roundDiscount * yearDiscount).toFixed(1));

  return {
    id: `${team.id}-pick-${year}-${round}-${index}`,
    teamId: team.id,
    bucket: "pick",
    name: `${year} ${sourceAbbreviation} Round ${round} Pick`,
    type: "DraftPick",
    role,
    position: "P",
    age: 18,
    contractLabel: "N/A",
    capHit: 0,
    baseCapHit: 0,
    term: 0,
    currentWar: 0,
    futureWar: discountedFutureWar,
    valueScore: discountedPickValue,
    risk: 50,
    shootingHand: "L",
    summary: conditions
      ? `${team.shortName} currently control this CapWages-listed pick with conditions attached.`
      : `${team.shortName} currently control this draft pick on CapWages.`,
    clauseType: null,
    clauseDetail: null,
    isTradeBlocked: false,
    retainedCapHit: 0,
    countsAgainstCap: true
  } satisfies MockAsset;
}

function dedupeAssetsByPriority(
  nhlAssets: MockAsset[],
  ahlAssets: MockAsset[],
  prospectAssets: MockAsset[]
) {
  const takenNames = new Set<string>();
  const prioritizedAssets: MockAsset[] = [];

  for (const asset of [...nhlAssets, ...ahlAssets]) {
    const normalizedName = normalizeAssetName(asset.name);
    if (takenNames.has(normalizedName)) {
      continue;
    }

    prioritizedAssets.push(asset);
    takenNames.add(normalizedName);
  }

  const uniqueProspectAssets = prospectAssets.filter((asset) => {
    const normalizedName = normalizeAssetName(asset.name);
    return !takenNames.has(normalizedName);
  });

  return [...prioritizedAssets, ...uniqueProspectAssets];
}

async function fetchCapWagesPageProps(team: MockTeam) {
  const slug = team.id.replace(/-/g, "_");
  const response = await fetch(`https://capwages.com/teams/${slug}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`CapWages fetch failed for ${team.abbreviation}: ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error(`CapWages payload missing for ${team.abbreviation}`);
  }

  const nextData = JSON.parse(match[1]) as {
    props?: {
      pageProps?: CapWagesPageProps;
    };
  };

  return nextData.props?.pageProps ?? {};
}

export async function getLiveSimTeams() {
  const results: MockTeam[] = [];
  const metrics = await getPlayerMetricData();

  for (const team of mockTeams) {
    const slug = team.id.replace(/-/g, "_");
    const capWagesResponse = await fetch(`https://capwages.com/teams/${slug}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml"
      },
      next: { revalidate: 3600 }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`CapWages fetch failed for ${team.abbreviation}: ${response.status}`);
        }

        const html = await response.text();
        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

        if (!match) {
          throw new Error(`CapWages payload missing for ${team.abbreviation}`);
        }

        const nextData = JSON.parse(match[1]) as {
          props?: {
            pageProps?: CapWagesPageProps;
          };
        };

        return {
          pageProps: nextData.props?.pageProps ?? ({} as CapWagesPageProps),
          sectionCapOverrides: extractSectionCapOverrides(html)
        };
      })
      .catch(() => ({
        pageProps: {} as CapWagesPageProps,
        sectionCapOverrides: new Map<string, SectionCapOverride>()
      }));
    const pageProps = capWagesResponse.pageProps;
    const rosterSections = pageProps.data?.roster ?? {};
    const nonRosterSections = pageProps.data?.["non-roster"] ?? {};
    const reservePlayers = pageProps.reserves ?? [];
    const draftPicks = (pageProps.draftPicks ?? []).filter((pick) => pick.isTradedAway !== true);

    const nhlAssets = Object.entries(rosterSections).flatMap(([sectionName, players]) =>
      players.map((player, index) =>
        buildPlayerAsset(team, player, "nhl", index, sectionName, capWagesResponse.sectionCapOverrides, metrics)
      )
    );
    const ahlAssets = Object.values(nonRosterSections)
      .flat()
      .map((player, index) => buildPlayerAsset(team, player, "ahl", index, undefined, undefined, metrics));
    const prospectAssets = reservePlayers.map((player, index) =>
      buildPlayerAsset(team, player, "prospect", index, undefined, undefined, metrics)
    );
    const pickAssets = draftPicks.map((pick, index) => mapDraftPick(team, pick, index));

    results.push({
      ...team,
      assets: [...dedupeAssetsByPriority(nhlAssets, ahlAssets, prospectAssets), ...pickAssets]
    });

    await delay(REQUEST_DELAY_MS);
  }

  return results;
}
