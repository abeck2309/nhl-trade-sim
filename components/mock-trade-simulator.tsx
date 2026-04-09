"use client";

import { useEffect, useRef, useState } from "react";
import {
  SALARY_CAP_CEILING,
  type MockAsset,
  type MockTeam,
  vgkTeamId
} from "@/lib/mock-trade-sim";

type MainTab = "trade" | "lineup";
type OrgTab = "nhl" | "ahl" | "prospect" | "pick";
type LineupPosition = "C" | "LW" | "RW" | "D" | "G";
type RetentionMap = Record<string, number>;
type RetainedCharge = {
  id: string;
  label: string;
  capHit: number;
};
type SubmittedTradeSummary = {
  narrative: string;
  vgkValueDelta: number;
  vgkWarDelta: number;
  vgkCapDelta: number;
};
type ToastState = {
  message: string;
  visible: boolean;
};
type LineupSlot =
  | "L1 LW"
  | "L1 C"
  | "L1 RW"
  | "L2 LW"
  | "L2 C"
  | "L2 RW"
  | "L3 LW"
  | "L3 C"
  | "L3 RW"
  | "L4 LW"
  | "L4 C"
  | "L4 RW"
  | "P1 LD"
  | "P1 RD"
  | "P2 LD"
  | "P2 RD"
  | "P3 LD"
  | "P3 RD"
  | "Starter"
  | "Backup"
  | "Scratch 1"
  | "Scratch 2"
  | "Scratch 3"
  | "Scratch G";

const lineupSlots: LineupSlot[] = [
  "L1 LW",
  "L1 C",
  "L1 RW",
  "L2 LW",
  "L2 C",
  "L2 RW",
  "L3 LW",
  "L3 C",
  "L3 RW",
  "L4 LW",
  "L4 C",
  "L4 RW",
  "P1 LD",
  "P1 RD",
  "P2 LD",
  "P2 RD",
  "P3 LD",
  "P3 RD",
  "Starter",
  "Backup",
  "Scratch 1",
  "Scratch 2",
  "Scratch 3",
  "Scratch G"
];

function formatSignedNumber(value: number, digits = 1) {
  const rounded = value.toFixed(digits);
  return value > 0 ? `+${rounded}` : rounded;
}

function sumAssets(assets: MockAsset[]) {
  return assets.reduce(
    (totals, asset) => ({
      valueScore: totals.valueScore + asset.valueScore,
      currentWar: totals.currentWar + (asset.currentWar ?? 0),
      futureWar: totals.futureWar + asset.futureWar,
      capHit: totals.capHit + asset.capHit,
      risk: totals.risk + asset.risk
    }),
    { valueScore: 0, currentWar: 0, futureWar: 0, capHit: 0, risk: 0 }
  );
}

function formatWarValue(value: number | null) {
  return value === null ? "" : value.toFixed(1);
}

function getTeamMarkerColors(team: MockTeam) {
  const markerColors: Record<string, { primary: string; secondary: string }> = {
    ANA: { primary: "#F47A38", secondary: "#B09862" },
    BOS: { primary: "#FFB81C", secondary: "#000000" },
    BUF: { primary: "#003087", secondary: "#FFB81C" },
    CAR: { primary: "#CC0000", secondary: "#111111" },
    CBJ: { primary: "#002654", secondary: "#CE1126" },
    CGY: { primary: "#C8102E", secondary: "#F1BE48" },
    CHI: { primary: "#CF0A2C", secondary: "#000000" },
    COL: { primary: "#6F263D", secondary: "#236192" },
    DAL: { primary: "#006847", secondary: "#8F8F8C" },
    DET: { primary: "#CE1126", secondary: "#FFFFFF" },
    EDM: { primary: "#041E42", secondary: "#FF4C00" },
    FLA: { primary: "#041E42", secondary: "#C8102E" },
    LAK: { primary: "#111111", secondary: "#A2AAAD" },
    MIN: { primary: "#154734", secondary: "#A6192E" },
    MTL: { primary: "#AF1E2D", secondary: "#192168" },
    NJD: { primary: "#CE1126", secondary: "#000000" },
    NSH: { primary: "#FFB81C", secondary: "#041E42" },
    NYI: { primary: "#00539B", secondary: "#F47D30" },
    NYR: { primary: "#0038A8", secondary: "#CE1126" },
    OTT: { primary: "#C52032", secondary: "#C2912C" },
    PHI: { primary: "#F74902", secondary: "#000000" },
    PIT: { primary: "#FCB514", secondary: "#000000" },
    SEA: { primary: "#001628", secondary: "#6BA2B8" },
    SJS: { primary: "#006D75", secondary: "#EA7200" },
    STL: { primary: "#002F87", secondary: "#FCB514" },
    TBL: { primary: "#002868", secondary: "#FFFFFF" },
    TOR: { primary: "#00205B", secondary: "#FFFFFF" },
    UTA: { primary: "#71AFE5", secondary: "#111111" },
    VAN: { primary: "#00205B", secondary: "#00843D" },
    VGK: { primary: "#B4975A", secondary: "#333F48" },
    WPG: { primary: "#041E42", secondary: "#7B303E" },
    WSH: { primary: "#041E42", secondary: "#C8102E" }
  };

  return markerColors[team.abbreviation] ?? team.palette;
}

function isIrLockedAsset(asset: MockAsset) {
  const role = asset.role.toUpperCase();
  return (
    role.includes("SEIR") ||
    role.includes("SELTIR") ||
    role.includes("LTIR") ||
    role.includes("IR")
  );
}

function totalCapHit(assets: MockAsset[]) {
  return assets.reduce((sum, asset) => sum + (asset.countsAgainstCap === false ? 0 : asset.capHit), 0);
}

function totalRetainedCharges(charges: RetainedCharge[]) {
  return charges.reduce((sum, charge) => sum + charge.capHit, 0);
}

function sortRoster(assets: MockAsset[]) {
  return [...assets].sort((a, b) => {
    if (a.bucket === "pick" && b.bucket !== "pick") return 1;
    if (a.bucket !== "pick" && b.bucket === "pick") return -1;

    const aParts = a.name.trim().split(/\s+/);
    const bParts = b.name.trim().split(/\s+/);
    const aLast = aParts[aParts.length - 1]?.toLowerCase() ?? "";
    const bLast = bParts[bParts.length - 1]?.toLowerCase() ?? "";
    const lastNameDelta = aLast.localeCompare(bLast);

    if (lastNameDelta !== 0) {
      return lastNameDelta;
    }

    return a.name.localeCompare(b.name);
  });
}

function buildNarrative({
  opponent,
  outgoingAssets,
  incomingAssets,
  vgkValueDelta,
  vgkWarDelta,
  vgkCapDelta
}: {
  opponent: MockTeam;
  outgoingAssets: MockAsset[];
  incomingAssets: MockAsset[];
  vgkValueDelta: number;
  vgkWarDelta: number;
  vgkCapDelta: number;
}) {
  const hockeyAssets = (assets: MockAsset[]) => assets.filter((asset) => asset.bucket !== "pick");
  const avgAge = (assets: MockAsset[]) => {
    const players = hockeyAssets(assets);
    if (players.length === 0) return null;
    return players.reduce((sum, asset) => sum + asset.age, 0) / players.length;
  };
  const countExpiring = (assets: MockAsset[]) =>
    assets.filter((asset) => asset.bucket !== "pick" && asset.term === 1).length;
  const countFutureAssets = (assets: MockAsset[]) =>
    assets.filter((asset) => asset.bucket === "prospect" || asset.bucket === "pick").length;
  const countRosterPlayers = (assets: MockAsset[]) => assets.filter((asset) => asset.bucket === "nhl").length;
  const totalFutureWar = (assets: MockAsset[]) => assets.reduce((sum, asset) => sum + asset.futureWar, 0);

  const outgoingAvgAge = avgAge(outgoingAssets);
  const incomingAvgAge = avgAge(incomingAssets);
  const ageDelta =
    outgoingAvgAge !== null && incomingAvgAge !== null
      ? Number((incomingAvgAge - outgoingAvgAge).toFixed(1))
      : null;
  const outgoingExpiringCount = countExpiring(outgoingAssets);
  const incomingExpiringCount = countExpiring(incomingAssets);
  const futureAssetDelta = countFutureAssets(incomingAssets) - countFutureAssets(outgoingAssets);
  const rosterAssetDelta = countRosterPlayers(incomingAssets) - countRosterPlayers(outgoingAssets);
  const futureWarDelta = Number((totalFutureWar(incomingAssets) - totalFutureWar(outgoingAssets)).toFixed(1));

  const sentences: string[] = [];

  if (vgkValueDelta > 0) {
    sentences.push(`Vegas gains ${Math.abs(vgkValueDelta).toFixed(0)} trade-value points in this deal.`);
  } else if (vgkValueDelta < 0) {
    sentences.push(`Vegas gives up ${Math.abs(vgkValueDelta).toFixed(0)} more trade-value points than it gets back.`);
  } else {
    sentences.push("Vegas comes out even on trade value in this model.");
  }

  if (vgkWarDelta > 0) {
    sentences.push(`The move adds ${vgkWarDelta.toFixed(1)} current WAR to the Vegas side.`);
  } else if (vgkWarDelta < 0) {
    sentences.push(`The move costs Vegas ${Math.abs(vgkWarDelta).toFixed(1)} current WAR right now.`);
  } else {
    sentences.push("The trade is neutral on current WAR.");
  }

  if (Math.abs(vgkCapDelta) < 0.1) {
    sentences.push("Cap impact is basically neutral for Vegas.");
  } else if (vgkCapDelta < 0) {
    const baseSentence = `Vegas creates $${Math.abs(vgkCapDelta).toFixed(2)}M in cap space.`;
    if (outgoingExpiringCount > 0 && incomingExpiringCount === 0) {
      sentences.push(`${baseSentence} ${outgoingExpiringCount === 1 ? "One outgoing contract is expiring, so some of that flexibility was short-term to begin with." : `${outgoingExpiringCount} outgoing contracts are expiring, so part of that flexibility was short-term to begin with.`}`);
    } else {
      sentences.push(baseSentence);
    }
  } else {
    const baseSentence = `Vegas takes on $${vgkCapDelta.toFixed(2)}M in additional cap hit.`;
    if (incomingExpiringCount > 0 && outgoingExpiringCount === 0) {
      sentences.push(`${baseSentence} ${incomingExpiringCount === 1 ? "That added money is partly temporary because one incoming deal expires after the season." : `That added money is partly temporary because ${incomingExpiringCount} incoming deals expire after the season.`}`);
    } else {
      sentences.push(baseSentence);
    }
  }

  if (ageDelta !== null) {
    if (ageDelta <= -1) {
      sentences.push(`Vegas gets younger by about ${Math.abs(ageDelta).toFixed(1)} years on average with the hockey players in this swap.`);
    } else if (ageDelta >= 1) {
      sentences.push(`Vegas gets older by about ${ageDelta.toFixed(1)} years on average with the hockey players in this swap.`);
    } else {
      sentences.push("The move leaves Vegas at roughly the same average age.");
    }
  }

  if (futureAssetDelta > 0 || futureWarDelta > 0.6) {
    sentences.push(`This deal leans more toward future value for Vegas, with a better longer-term upside profile than the package going out.`);
  } else if (rosterAssetDelta > 0 && vgkWarDelta >= 0) {
    sentences.push(`This is more of a present-tense hockey trade for Vegas, aimed at helping the NHL roster immediately.`);
  } else if (futureAssetDelta < 0 && vgkWarDelta > 0) {
    sentences.push(`Vegas is clearly paying future-oriented assets for more immediate roster help here.`);
  } else if (futureAssetDelta < 0 && vgkWarDelta <= 0) {
    sentences.push(`Vegas is moving future-facing assets without clearly improving the immediate roster, which makes this a riskier profile deal.`);
  }

  if (outgoingExpiringCount > 0 && incomingExpiringCount > 0) {
    sentences.push("Both sides are moving expiring money, so the cap effect is not just a simple long-term cash-out.");
  }

  sentences.push(`From a Vegas perspective, this is a ${vgkValueDelta >= 0 && vgkWarDelta >= 0 ? "positive" : vgkValueDelta < 0 && vgkWarDelta < 0 ? "costly" : "mixed"} outcome against ${opponent.shortName}.`);

  return sentences.join(" ");
}

function slotAllowedPositions(slot: LineupSlot): LineupPosition[] {
  if (slot.endsWith("LW") || slot.endsWith("RW") || slot.endsWith("C")) {
    return ["C", "LW", "RW"];
  }
  if (slot === "Scratch G") return ["G"];
  if (slot === "Starter" || slot === "Backup") return ["G"];
  if (slot.startsWith("Scratch")) return ["C", "LW", "RW", "D"];
  return ["D"];
}

function clampRetention(value: number) {
  return Math.max(0, Math.min(50, Math.round(value)));
}

function assetSupportsRetention(asset: MockAsset) {
  return asset.capHit > 0 && asset.bucket !== "prospect" && asset.bucket !== "pick";
}

function getRetentionPercent(assetId: string, retentionMap: RetentionMap) {
  return clampRetention(retentionMap[assetId] ?? 0);
}

function getRetainedCapHit(asset: MockAsset, retentionMap: RetentionMap) {
  return Number((asset.capHit * (getRetentionPercent(asset.id, retentionMap) / 100)).toFixed(2));
}

function getEffectiveCapHit(asset: MockAsset, retentionMap: RetentionMap) {
  return Number((asset.capHit - getRetainedCapHit(asset, retentionMap)).toFixed(2));
}

function getCapDisplay(asset: MockAsset) {
  if (asset.bucket === "prospect" || asset.bucket === "pick") {
    return "N/A";
  }

  return `$${asset.capHit.toFixed(2)}M x ${asset.term} yr${asset.term === 1 ? "" : "s"}${asset.hasExtension ? " (ext.)" : ""}`;
}

function getAvailablePlayersForSlot(
  slot: LineupSlot,
  lineupSelections: Partial<Record<LineupSlot, string>>,
  lineupValidPlayers: Record<LineupPosition, MockAsset[]>
) {
  const allowedPositions = slotAllowedPositions(slot);
  const seenIds = new Set<string>();
  const players = allowedPositions.flatMap((position) => lineupValidPlayers[position]).filter((asset) => {
    if (seenIds.has(asset.id)) {
      return false;
    }

    seenIds.add(asset.id);
    return true;
  });

  return players.filter((asset) => {
    const alreadyUsed = Object.entries(lineupSelections).some(
      ([otherSlot, assetId]) => otherSlot !== slot && assetId === asset.id
    );
    return !alreadyUsed || lineupSelections[slot] === asset.id;
  });
}

function buildRetainedCharge(asset: MockAsset, retentionMap: RetentionMap): RetainedCharge | null {
  const capHit = getRetainedCapHit(asset, retentionMap);

  if (capHit <= 0) {
    return null;
  }

  return {
    id: `retained-${asset.id}`,
    label: `Retained on ${asset.name}`,
    capHit
  };
}

function cloneAssetForTrade(asset: MockAsset, teamId: string, retentionMap: RetentionMap) {
  const retainedPct = getRetentionPercent(asset.id, retentionMap);
  const effectiveCapHit = getEffectiveCapHit(asset, retentionMap);
  const retainedSuffix = retainedPct > 0 ? ` | ${retainedPct}% retained` : "";

  return {
    ...asset,
    id: `${asset.id}-moved-${teamId}`,
    teamId,
    capHit: effectiveCapHit,
    contractLabel: asset.bucket === "prospect" || asset.bucket === "pick" ? "N/A" : `${asset.contractLabel}${retainedSuffix}`,
    retainedCapHit: getRetainedCapHit(asset, retentionMap),
    countsAgainstCap: asset.countsAgainstCap
  } satisfies MockAsset;
}

function SummaryPill({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
      : tone === "bad"
        ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
        : "border-white/10 bg-white/[0.04] text-white";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

export function MockTradeSimulator({ teams }: { teams: MockTeam[] }) {
  const vgkBase = teams.find((team) => team.id === vgkTeamId) ?? teams[0];
  const opponentPool = teams.filter((team) => team.id !== vgkTeamId);
  const defaultOpponentId = opponentPool[0]?.id ?? "";
  const initialOpponentRosters = Object.fromEntries(
    opponentPool.map((team) => [team.id, sortRoster(team.assets)])
  ) as Record<string, MockAsset[]>;

  const [activeTab, setActiveTab] = useState<MainTab>("trade");
  const [selectedOpponentId, setSelectedOpponentId] = useState(defaultOpponentId);
  const [pendingVgkIds, setPendingVgkIds] = useState<string[]>([]);
  const [pendingOpponentIds, setPendingOpponentIds] = useState<string[]>([]);
  const [pendingVgkRetentions, setPendingVgkRetentions] = useState<RetentionMap>({});
  const [pendingOpponentRetentions, setPendingOpponentRetentions] = useState<RetentionMap>({});
  const [appliedTradeCount, setAppliedTradeCount] = useState(0);
  const [vgkRoster, setVgkRoster] = useState<MockAsset[]>(sortRoster(vgkBase.assets));
  const [opponentRosters, setOpponentRosters] = useState<Record<string, MockAsset[]>>(initialOpponentRosters);
  const [lineupSelections, setLineupSelections] = useState<Partial<Record<LineupSlot, string>>>({});
  const [retainedChargesByTeam, setRetainedChargesByTeam] = useState<Record<string, RetainedCharge[]>>(
    Object.fromEntries(teams.map((team) => [team.id, []])) as Record<string, RetainedCharge[]>
  );
  const [submittedTradeSummary, setSubmittedTradeSummary] = useState<SubmittedTradeSummary | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false });
  const [calledUpAhlIds, setCalledUpAhlIds] = useState<string[]>([]);
  const [selectedCallupId, setSelectedCallupId] = useState("");
  const [selectedCalldownId, setSelectedCalldownId] = useState("");
  const [sandboxMode, setSandboxMode] = useState(false);
  const tradeSummaryRef = useRef<HTMLDivElement | null>(null);

  const opponentBase = teams.find((team) => team.id === selectedOpponentId) ?? opponentPool[0];
  const currentVgkRoster = vgkRoster;
  const currentOpponentRoster = opponentBase
    ? opponentRosters[selectedOpponentId] ?? sortRoster(opponentBase.assets)
    : [];
  const vgkRetainedCharges = retainedChargesByTeam[vgkTeamId] ?? [];
  const opponentRetainedCharges = retainedChargesByTeam[selectedOpponentId] ?? [];

  const pendingVgkAssets = currentVgkRoster.filter((asset) => pendingVgkIds.includes(asset.id));
  const pendingOpponentAssets = currentOpponentRoster.filter((asset) => pendingOpponentIds.includes(asset.id));
  const vgkSentTotals = sumAssets(pendingVgkAssets);
  const opponentSentTotals = sumAssets(pendingOpponentAssets);

  const vgkOutgoingCapEffect = totalCapHit(
    pendingVgkAssets.filter((asset) => asset.bucket === "nhl").map((asset) => ({
      ...asset,
      capHit: getEffectiveCapHit(asset, pendingVgkRetentions)
    }))
  );
  const opponentOutgoingCapEffect = totalCapHit(
    pendingOpponentAssets.filter((asset) => asset.bucket === "nhl").map((asset) => ({
      ...asset,
      capHit: getEffectiveCapHit(asset, pendingOpponentRetentions)
    }))
  );

  const vgkValueDelta = opponentSentTotals.valueScore - vgkSentTotals.valueScore;
  const opponentValueDelta = vgkSentTotals.valueScore - opponentSentTotals.valueScore;
  const vgkWarDelta = opponentSentTotals.currentWar - vgkSentTotals.currentWar;
  const opponentWarDelta = vgkSentTotals.currentWar - opponentSentTotals.currentWar;
  const vgkCapDelta = opponentOutgoingCapEffect - vgkOutgoingCapEffect;
  const opponentCapDelta = vgkOutgoingCapEffect - opponentOutgoingCapEffect;
  const currentVgkNhlRoster = currentVgkRoster.filter((asset) => asset.bucket === "nhl");
  const currentVgkAhlRoster = currentVgkRoster.filter((asset) => asset.bucket === "ahl");
  const calledUpAhlPlayers = currentVgkAhlRoster.filter((asset) => calledUpAhlIds.includes(asset.id));
  const irLockedAssets = currentVgkNhlRoster.filter((asset) => isIrLockedAsset(asset));
  const lineupEligibleNhlAssets = currentVgkNhlRoster.filter((asset) => !isIrLockedAsset(asset));
  const currentOpponentNhlRoster = currentOpponentRoster.filter((asset) => asset.bucket === "nhl");
  const currentVgkCap = totalCapHit(currentVgkNhlRoster) + totalRetainedCharges(vgkRetainedCharges);
  const currentOpponentCap = totalCapHit(currentOpponentNhlRoster) + totalRetainedCharges(opponentRetainedCharges);
  const projectedVgkCap = currentVgkCap + vgkCapDelta;
  const projectedOpponentCap = currentOpponentCap + opponentCapDelta;
  const isVgkOverCap = projectedVgkCap > SALARY_CAP_CEILING;
  const isOpponentOverCap = projectedOpponentCap > SALARY_CAP_CEILING;
  const vgkOverage = Math.max(0, projectedVgkCap - SALARY_CAP_CEILING);
  const opponentOverage = Math.max(0, projectedOpponentCap - SALARY_CAP_CEILING);
  const canSubmitTrade =
    Boolean(opponentBase) &&
    (sandboxMode || !(isVgkOverCap || isOpponentOverCap)) &&
    (pendingVgkIds.length > 0 || pendingOpponentIds.length > 0);

  const vgkForwards = [...lineupEligibleNhlAssets, ...calledUpAhlPlayers].filter((asset) => asset.type === "Forward");
  const vgkDefense = [...lineupEligibleNhlAssets, ...calledUpAhlPlayers].filter((asset) => asset.type === "Defense");
  const vgkGoalies = [...lineupEligibleNhlAssets, ...calledUpAhlPlayers].filter((asset) => asset.type === "Goalie");

  const lineupValidPlayers: Record<LineupPosition, MockAsset[]> = {
    C: vgkForwards,
    LW: vgkForwards,
    RW: vgkForwards,
    D: vgkDefense,
    G: vgkGoalies
  };

  useEffect(() => {
    const remainingIds = new Set(currentVgkRoster.map((asset) => asset.id));
    const eligibleIds = new Set([
      ...vgkForwards.map((asset) => asset.id),
      ...vgkDefense.map((asset) => asset.id),
      ...vgkGoalies.map((asset) => asset.id)
    ]);

    setLineupSelections((current) => {
      const nextSelections: Partial<Record<LineupSlot, string>> = { ...current };
      let didChange = false;

      lineupSlots.forEach((slot) => {
        const assignedId = current[slot];
        if (assignedId && (!remainingIds.has(assignedId) || !eligibleIds.has(assignedId))) {
          delete nextSelections[slot];
          didChange = true;
        }
      });

      return didChange ? nextSelections : current;
    });
  }, [
    currentVgkRoster,
    calledUpAhlIds.join("|"),
    vgkForwards.map((asset) => asset.id).join("|"),
    vgkDefense.map((asset) => asset.id).join("|"),
    vgkGoalies.map((asset) => asset.id).join("|")
  ]);

  useEffect(() => {
    const ahlIds = new Set(currentVgkAhlRoster.map((asset) => asset.id));

    setCalledUpAhlIds((current) => {
      const next = current.filter((id) => ahlIds.has(id));
      return next.length === current.length && next.every((id, index) => id === current[index]) ? current : next;
    });
    setSelectedCallupId((current) => (current && !ahlIds.has(current) ? "" : current));
    setSelectedCalldownId((current) => (current && !ahlIds.has(current) ? "" : current));
  }, [currentVgkAhlRoster.map((asset) => asset.id).join("|")]);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [toast.visible]);

  function resetForOpponent(teamId: string) {
    setSelectedOpponentId(teamId);
    setPendingOpponentIds([]);
    setPendingOpponentRetentions({});
    setActiveTab("trade");
  }

  function togglePending(side: "vgk" | "opponent", assetId: string) {
    const selectedIds = side === "vgk" ? pendingVgkIds : pendingOpponentIds;
    const setter = side === "vgk" ? setPendingVgkIds : setPendingOpponentIds;
    const retentionSetter = side === "vgk" ? setPendingVgkRetentions : setPendingOpponentRetentions;

    setter(
      selectedIds.includes(assetId)
        ? selectedIds.filter((id) => id !== assetId)
        : [...selectedIds, assetId]
    );

    if (selectedIds.includes(assetId)) {
      retentionSetter((current) => {
        const next = { ...current };
        delete next[assetId];
        return next;
      });
    }
  }

  function updateRetention(side: "vgk" | "opponent", assetId: string, value: number) {
    const setter = side === "vgk" ? setPendingVgkRetentions : setPendingOpponentRetentions;
    setter((current) => ({
      ...current,
      [assetId]: clampRetention(value)
    }));
  }

  function callUpSelectedPlayer() {
    if (!selectedCallupId || calledUpAhlIds.includes(selectedCallupId)) {
      return;
    }

    setCalledUpAhlIds((current) => [...current, selectedCallupId]);
    setSelectedCallupId("");
  }

  function callDownSelectedPlayer() {
    if (!selectedCalldownId) {
      return;
    }

    setCalledUpAhlIds((current) => current.filter((id) => id !== selectedCalldownId));
    setLineupSelections((current) => {
      const nextSelections: Partial<Record<LineupSlot, string>> = { ...current };

      lineupSlots.forEach((slot) => {
        if (nextSelections[slot] === selectedCalldownId) {
          delete nextSelections[slot];
        }
      });

      return nextSelections;
    });
    setSelectedCalldownId("");
  }

  function submitTrade() {
    if (!canSubmitTrade || !opponentBase) {
      return;
    }

    const nextVgkRoster = sortRoster([
      ...currentVgkRoster.filter((asset) => !pendingVgkIds.includes(asset.id)),
      ...pendingOpponentAssets.map((asset) => cloneAssetForTrade(asset, vgkTeamId, pendingOpponentRetentions))
    ]);
    const nextOpponentRoster = sortRoster([
      ...currentOpponentRoster.filter((asset) => !pendingOpponentIds.includes(asset.id)),
      ...pendingVgkAssets.map((asset) => cloneAssetForTrade(asset, opponentBase.id, pendingVgkRetentions))
    ]);
    const vgkNewCharges = pendingVgkAssets
      .map((asset) => buildRetainedCharge(asset, pendingVgkRetentions))
      .filter((charge): charge is RetainedCharge => Boolean(charge));
    const opponentNewCharges = pendingOpponentAssets
      .map((asset) => buildRetainedCharge(asset, pendingOpponentRetentions))
      .filter((charge): charge is RetainedCharge => Boolean(charge));

    setVgkRoster(nextVgkRoster);
    setOpponentRosters((current) => ({
      ...current,
      [opponentBase.id]: nextOpponentRoster
    }));
    setRetainedChargesByTeam((current) => ({
      ...current,
      [vgkTeamId]: [...(current[vgkTeamId] ?? []), ...vgkNewCharges],
      [opponentBase.id]: [...(current[opponentBase.id] ?? []), ...opponentNewCharges]
    }));
    setPendingVgkIds([]);
    setPendingOpponentIds([]);
    setPendingVgkRetentions({});
    setPendingOpponentRetentions({});
    setAppliedTradeCount((count) => count + 1);
    setSubmittedTradeSummary({
      narrative: buildNarrative({
        opponent: opponentBase,
        outgoingAssets: pendingVgkAssets,
        incomingAssets: pendingOpponentAssets,
        vgkValueDelta,
        vgkWarDelta,
        vgkCapDelta
      }),
      vgkValueDelta,
      vgkWarDelta,
      vgkCapDelta
    });
    setToast({ message: "Trade completed", visible: true });
    window.requestAnimationFrame(() => {
      tradeSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateLineup(slot: LineupSlot, assetId: string) {
    setLineupSelections((current) => ({
      ...current,
      [slot]: assetId || undefined
    }));
  }

  return (
    <section className="space-y-6">
      {toast.visible ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="rounded-full border border-emerald-300/30 bg-emerald-500/90 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.25)]">
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-slate-500/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <div className="relative border-b border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.09),rgba(148,163,184,0.04))] px-5 py-5 md:px-7">
          <div className="flex flex-col gap-5 xl:pr-[32rem]">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                VGK Trade Lab
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-white md:text-4xl">
                Live organization simulator with a real post-trade workflow
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                Build a trade between VGK and one selected opponent, submit it, and then use the updated VGK
                roster in the lineup builder. Player pools now come from CapWages roster, non-roster, reserve,
                and draft-pick tables, with clause and retention rules layered into the simulator.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("trade")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === "trade"
                  ? "bg-white text-slate-950"
                  : "border border-white/15 bg-white/[0.03] text-slate-200"
              }`}
            >
              Trade Simulator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("lineup")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === "lineup"
                  ? "bg-white text-slate-950"
                  : "border border-white/15 bg-white/[0.03] text-slate-200"
              }`}
            >
              VGK Lineup Creation
            </button>
          </div>

          <div className="mt-5 flex justify-end xl:mt-0 xl:absolute xl:bottom-5 xl:left-[59.18%] xl:right-5">
            <div className="rounded-[1.4rem] border border-white/10 bg-[#0f1725]/90 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Sandbox Mode
              </p>
              <p className="mt-2 pr-10 text-sm leading-6 text-slate-400">
                Turn off clause locks and salary-cap restrictions for free-form testing.
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {sandboxMode ? "Clause and cap restrictions disabled" : "Live rules active"}
                </p>
                <button
                  type="button"
                  aria-pressed={sandboxMode}
                  onClick={() => setSandboxMode((current) => !current)}
                  className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
                    sandboxMode
                      ? "border-emerald-300/35 bg-emerald-400/25"
                      : "border-white/15 bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                      sandboxMode ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "trade" ? (
          <>
            <div className="grid gap-0 xl:grid-cols-[1.45fr_1fr]">
              <div className="overflow-visible border-b border-white/10 p-5 xl:border-b-0 xl:border-r md:p-7">
                <div className="grid gap-5 pl-2 md:pl-3">
                  <TradeWorkbench
                    title="Vegas Golden Knights"
                    subtitle="VGK outbound package"
                    team={vgkBase}
                    teamOptions={teams}
                    selectedTeamId={vgkTeamId}
                    selectedIds={pendingVgkIds}
                    outgoingAssets={pendingVgkAssets}
                    retentionMap={pendingVgkRetentions}
                    onTeamChange={() => {}}
                    onRemoveAsset={(assetId) => togglePending("vgk", assetId)}
                    onRetentionChange={(assetId, value) => updateRetention("vgk", assetId, value)}
                    locked
                  />

                  {opponentBase ? (
                    <TradeWorkbench
                      title={opponentBase.name}
                      subtitle={`${opponentBase.abbreviation} outbound package`}
                      team={opponentBase}
                      teamOptions={teams}
                      selectedTeamId={selectedOpponentId}
                      selectedIds={pendingOpponentIds}
                      outgoingAssets={pendingOpponentAssets}
                      retentionMap={pendingOpponentRetentions}
                      onTeamChange={resetForOpponent}
                      onRemoveAsset={(assetId) => togglePending("opponent", assetId)}
                      onRetentionChange={(assetId, value) => updateRetention("opponent", assetId, value)}
                    />
                  ) : null}

                  <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-[#0f1725] p-5 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Submit Trade
                      </p>
                      <p className="text-sm leading-6 text-slate-300">
                        Applying the deal updates the VGK roster, keeps retained salary on the books, and blocks
                        submission if either club would finish above the ${SALARY_CAP_CEILING.toFixed(1)}M ceiling.
                      </p>
                      {sandboxMode ? (
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">
                          Sandbox mode active: clause and salary-cap restrictions are currently disabled.
                        </p>
                      ) : null}
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        NHL cap only: VGK ${projectedVgkCap.toFixed(2)}M | {opponentBase?.abbreviation ?? "---"} $
                        {projectedOpponentCap.toFixed(2)}M
                      </p>
                      {(vgkRetainedCharges.length > 0 || opponentRetainedCharges.length > 0) && (
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Retained on books: VGK ${totalRetainedCharges(vgkRetainedCharges).toFixed(2)}M |{" "}
                          {opponentBase?.abbreviation ?? "---"} ${totalRetainedCharges(opponentRetainedCharges).toFixed(2)}M
                        </p>
                      )}
                      {!sandboxMode && (isVgkOverCap || isOpponentOverCap) && (
                        <p className="text-sm font-semibold text-rose-200">
                          Cap violation:{" "}
                          {isVgkOverCap
                            ? `VGK would be $${vgkOverage.toFixed(2)}M over the $${SALARY_CAP_CEILING.toFixed(1)}M ceiling.`
                            : `${opponentBase?.abbreviation ?? "OPP"} would be $${opponentOverage.toFixed(2)}M over the $${SALARY_CAP_CEILING.toFixed(1)}M ceiling.`}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={submitTrade}
                      disabled={!canSubmitTrade}
                      className={`rounded-full px-6 py-3 text-sm font-semibold ${
                        canSubmitTrade
                          ? "bg-white text-slate-950 hover:bg-slate-200"
                          : "cursor-not-allowed bg-white/10 text-slate-500"
                      }`}
                    >
                      Submit Trade
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-0">
                <RosterModule
                  team={vgkBase}
                  title="VGK Current Roster"
                  assets={currentVgkRoster}
                  selectedIds={pendingVgkIds}
                  sandboxMode={sandboxMode}
                  onToggleAsset={(assetId) => togglePending("vgk", assetId)}
                />
                {opponentBase ? (
                  <RosterModule
                    team={opponentBase}
                    title={`${opponentBase.shortName} Current Roster`}
                    assets={currentOpponentRoster}
                    selectedIds={pendingOpponentIds}
                    sandboxMode={sandboxMode}
                    onToggleAsset={(assetId) => togglePending("opponent", assetId)}
                    bordered
                  />
                ) : null}
              </div>
            </div>

            <div ref={tradeSummaryRef} className="grid gap-4 border-t border-white/10 bg-[linear-gradient(180deg,rgba(148,163,184,0.05),rgba(15,23,42,0.02))] p-5 md:p-7 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.6rem] border border-white/10 bg-[#0f1725] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                  Trade Summary
                </p>
                <div className="mt-4 min-h-[184px] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  {submittedTradeSummary ? (
                    <>
                      <p className="text-sm leading-7 text-slate-200">{submittedTradeSummary.narrative}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
                        VGK NHL cap now ${currentVgkCap.toFixed(2)}M | Ceiling ${SALARY_CAP_CEILING.toFixed(1)}M
                      </p>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-[#0c1420] p-4">
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <SummaryPill
                      label="VGK Value"
                      value={
                        submittedTradeSummary
                          ? formatSignedNumber(submittedTradeSummary.vgkValueDelta, 0)
                          : "-"
                      }
                      tone={
                        !submittedTradeSummary
                          ? "neutral"
                          : submittedTradeSummary.vgkValueDelta > 0
                            ? "good"
                            : submittedTradeSummary.vgkValueDelta < 0
                              ? "bad"
                              : "neutral"
                      }
                    />
                    <SummaryPill
                      label="VGK WAR"
                      value={
                        submittedTradeSummary
                          ? formatSignedNumber(submittedTradeSummary.vgkWarDelta)
                          : "-"
                      }
                      tone={
                        !submittedTradeSummary
                          ? "neutral"
                          : submittedTradeSummary.vgkWarDelta > 0
                            ? "good"
                            : submittedTradeSummary.vgkWarDelta < 0
                              ? "bad"
                              : "neutral"
                      }
                    />
                    <SummaryPill
                      label="VGK Cap"
                      value={
                        submittedTradeSummary
                          ? `${submittedTradeSummary.vgkCapDelta > 0 ? "+" : ""}$${submittedTradeSummary.vgkCapDelta.toFixed(2)}M`
                          : "-"
                      }
                      tone={
                        !submittedTradeSummary
                          ? "neutral"
                          : submittedTradeSummary.vgkCapDelta < 0
                            ? "good"
                            : submittedTradeSummary.vgkCapDelta > 0
                              ? "bad"
                              : "neutral"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-5 md:p-7">
            <div className="rounded-[1.8rem] border border-white/10 bg-[#0f1725] p-5">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                  VGK Lineup Builder
                </p>
                <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white">
                  Post-trade lineup creation
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  Any forward can be used at any forward spot. Current lineup-eligible pool: {vgkForwards.length} forwards, {vgkDefense.length} defensemen, {vgkGoalies.length} goalies. Submitted trades so far: {appliedTradeCount}.
                </p>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#162132] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Call Up</p>
                    <div className="mt-3 flex gap-3">
                      <select
                        value={selectedCallupId}
                        onChange={(event) => setSelectedCallupId(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0f1725] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                      >
                        <option value="">Select AHL player</option>
                        {currentVgkAhlRoster
                          .filter((asset) => !calledUpAhlIds.includes(asset.id))
                          .map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name} ({asset.position})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={callUpSelectedPlayer}
                        disabled={!selectedCallupId}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                          selectedCallupId ? "bg-white text-slate-950" : "bg-white/10 text-slate-500"
                        }`}
                      >
                        Call Up
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#162132] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Call Down</p>
                    <div className="mt-3 flex gap-3">
                      <select
                        value={selectedCalldownId}
                        onChange={(event) => setSelectedCalldownId(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0f1725] px-3 py-3 text-sm text-white outline-none focus:border-white/30"
                      >
                        <option value="">Select called-up AHL player</option>
                        {calledUpAhlPlayers.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} ({asset.position})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={callDownSelectedPlayer}
                        disabled={!selectedCalldownId}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                          selectedCalldownId ? "bg-white text-slate-950" : "bg-white/10 text-slate-500"
                        }`}
                      >
                        Call Down
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-5">
                <LineupRow
                  title="Line 1"
                  slots={["L1 LW", "L1 C", "L1 RW"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                />
                <LineupRow
                  title="Line 2"
                  slots={["L2 LW", "L2 C", "L2 RW"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                />
                <LineupRow
                  title="Line 3"
                  slots={["L3 LW", "L3 C", "L3 RW"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                />
                <LineupRow
                  title="Line 4"
                  slots={["L4 LW", "L4 C", "L4 RW"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                />
                <LineupRow
                  title="Pair 1"
                  slots={["P1 LD", "P1 RD"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                  compact
                />
                <LineupRow
                  title="Pair 2"
                  slots={["P2 LD", "P2 RD"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                  compact
                />
                <LineupRow
                  title="Pair 3"
                  slots={["P3 LD", "P3 RD"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                  compact
                />
                <LineupRow
                  title="Goalies"
                  slots={["Starter", "Backup"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                  compact
                  vertical
                />
                <LineupRow
                  title="Scratches"
                  slots={["Scratch 1", "Scratch 2", "Scratch 3", "Scratch G"]}
                  lineupSelections={lineupSelections}
                  lineupValidPlayers={lineupValidPlayers}
                  onUpdateLineup={updateLineup}
                  compact
                />
                <InjuredReserveRow assets={irLockedAssets} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TradeWorkbench({
  title,
  subtitle,
  team,
  teamOptions,
  selectedTeamId,
  selectedIds,
  outgoingAssets,
  retentionMap,
  onTeamChange,
  onRemoveAsset,
  onRetentionChange,
  locked = false
}: {
  title: string;
  subtitle: string;
  team: MockTeam;
  teamOptions: MockTeam[];
  selectedTeamId: string;
  selectedIds: string[];
  outgoingAssets: MockAsset[];
  retentionMap: RetentionMap;
  onTeamChange: (teamId: string) => void;
  onRemoveAsset: (assetId: string) => void;
  onRetentionChange: (assetId: string, value: number) => void;
  locked?: boolean;
}) {
  const markerColors = getTeamMarkerColors(team);

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,#101926,#0d1520)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{subtitle}</p>
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-10 rounded-full border border-white/15 shadow-[0_0_24px_rgba(255,255,255,0.08)]"
              style={{
                background: `linear-gradient(90deg, ${markerColors.primary} 0%, ${markerColors.secondary} 100%)`,
                boxShadow: `0 0 18px ${markerColors.primary}33`
              }}
            />
            <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">{title}</h3>
          </div>
        </div>

        {locked ? null : (
          <select
            value={selectedTeamId}
            onChange={(event) => onTeamChange(event.target.value)}
            className="w-full max-w-[260px] rounded-2xl border border-white/10 bg-[#192231] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white/30"
          >
            {teamOptions
              .filter((item) => item.id !== vgkTeamId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="mt-5">
        <WorkbenchColumn
          title="Sending"
          assets={outgoingAssets}
          retentionMap={retentionMap}
          emptyText={`Select assets from the ${team.shortName} roster table.`}
          onRemoveAsset={onRemoveAsset}
          onRetentionChange={onRetentionChange}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>{selectedIds.length} assets staged</span>
        <span>{team.conference} • {team.division}</span>
      </div>
    </div>
  );
}

function WorkbenchColumn({
  title,
  assets,
  retentionMap,
  emptyText,
  onRemoveAsset,
  onRetentionChange
}: {
  title: string;
  assets: MockAsset[];
  retentionMap: RetentionMap;
  emptyText: string;
  onRemoveAsset: (assetId: string) => void;
  onRetentionChange: (assetId: string, value: number) => void;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-[#0b121c] p-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-200/12 to-white/[0.03] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">{title}</p>
      </div>
      {assets.length === 0 ? (
        <div className="flex min-h-[110px] items-center justify-center px-4 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {assets.map((asset) => {
            const retainedPct = getRetentionPercent(asset.id, retentionMap);
            const retainedCap = getRetainedCapHit(asset, retentionMap);

            return (
              <div key={asset.id} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{asset.name}</p>
                      {asset.clauseType ? (
                        <span className="rounded-full border border-rose-300/25 bg-rose-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200">
                          {asset.clauseType}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {asset.position} • {asset.role}
                      {asset.currentWar !== null ? ` • WAR ${formatWarValue(asset.currentWar)}` : ""}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Cap {getCapDisplay(asset)}
                      {retainedPct > 0 ? ` • Retained ${retainedPct}% ($${retainedCap.toFixed(2)}M)` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAsset(asset.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
                    aria-label={`Remove ${asset.name}`}
                  >
                    x
                  </button>
                </div>

                {assetSupportsRetention(asset) ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Retained Salary
                      </p>
                      <span className="text-xs font-semibold text-slate-200">{retainedPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={retainedPct}
                      onChange={(event) => onRetentionChange(asset.id, Number(event.target.value))}
                      className="mt-3 w-full accent-slate-200"
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>0%</span>
                      <span>Up to 50%</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RosterModule({
  team,
  title,
  assets,
  selectedIds,
  sandboxMode,
  onToggleAsset,
  bordered = false
}: {
  team: MockTeam;
  title: string;
  assets: MockAsset[];
  selectedIds: string[];
  sandboxMode: boolean;
  onToggleAsset: (assetId: string) => void;
  bordered?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<OrgTab>("nhl");
  const tabAssets = assets.filter((asset) => asset.bucket === activeTab);
  const tabs: Array<{ id: OrgTab; label: string }> = [
    { id: "nhl", label: "NHL" },
    { id: "ahl", label: "AHL" },
    { id: "prospect", label: "Prospects" },
    { id: "pick", label: "Draft" }
  ];

  return (
    <div className={`p-5 md:p-7 ${bordered ? "border-t border-white/10" : ""}`}>
      <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,#111827,#0d1520)]">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getTeamMarkerColors(team).primary }}
              />
              <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">{title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const count = assets.filter((asset) => asset.bucket === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                      activeTab === tab.id
                        ? "bg-white text-slate-950"
                        : "border border-white/12 bg-white/[0.03] text-slate-300"
                    }`}
                  >
                    {tab.label} {count > 0 ? count : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {activeTab === "pick" ? (
          <div className="grid grid-cols-[1.4fr_1.2fr] border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <p>Pick</p>
            <p>Details</p>
          </div>
        ) : (
          <div className="grid grid-cols-[1.55fr_0.45fr_0.9fr_0.45fr_0.5fr] border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <p>Name</p>
            <p>Pos</p>
            <p>Cap</p>
            <p>Age</p>
            <p className="text-right">WAR</p>
          </div>
        )}

        <div className="max-h-[430px] overflow-y-auto">
          {tabAssets.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No {activeTab === "pick" ? "draft assets" : activeTab} assets available right now.
            </div>
          ) : (
            tabAssets.map((asset, index) => {
              const isSelected = selectedIds.includes(asset.id);
              const isBlocked = Boolean(asset.isTradeBlocked) && !sandboxMode;
              const isWarningOnly = asset.clauseType === "M-NTC" && !isBlocked && !sandboxMode;
              const isNtcBlocked = asset.clauseType === "NTC" && isBlocked && !sandboxMode;
              const isNmcBlocked = asset.clauseType === "NMC" && isBlocked && !sandboxMode;

              if (activeTab === "pick") {
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => onToggleAsset(asset.id)}
                    className={`grid w-full grid-cols-[1.4fr_1.2fr] items-center gap-2 border-b border-white/5 px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? "bg-slate-200/12 text-white"
                        : index % 2 === 0
                          ? "bg-white/[0.02] text-slate-100 hover:bg-white/[0.05]"
                          : "bg-transparent text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{asset.name}</p>
                    </div>
                    <p className="text-sm text-slate-400">{asset.role}</p>
                  </button>
                );
              }

              return (
                <button
                  key={asset.id}
                  type="button"
                  disabled={isBlocked}
                  onClick={() => onToggleAsset(asset.id)}
                  style={
                    isNtcBlocked
                      ? {
                          backgroundColor: "rgba(249, 115, 22, 0.12)"
                        }
                      : undefined
                  }
                  className={`grid w-full grid-cols-[1.55fr_0.45fr_0.9fr_0.45fr_0.5fr] items-center gap-2 border-b border-white/5 px-4 py-3 text-left text-sm transition ${
                    isNmcBlocked
                      ? "cursor-not-allowed bg-rose-500/5 text-slate-500"
                      : isNtcBlocked
                        ? "cursor-not-allowed text-orange-50"
                        : isWarningOnly
                          ? isSelected
                            ? "bg-amber-300/18 text-amber-50 hover:bg-amber-300/22"
                          : "bg-amber-300/10 text-slate-100 hover:bg-amber-300/16"
                      : isSelected
                        ? "bg-slate-200/12 text-white"
                        : index % 2 === 0
                          ? "bg-white/[0.02] text-slate-100 hover:bg-white/[0.05]"
                          : "bg-transparent text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{asset.name}</p>
                      {asset.clauseType ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            sandboxMode
                              ? "border border-white/15 bg-white/[0.04] text-slate-200"
                              : asset.clauseType === "M-NTC"
                              ? "border border-amber-300/30 bg-amber-300/12 text-amber-100"
                              : asset.clauseType === "NTC"
                                ? "border border-orange-400/45 bg-orange-500/20 text-orange-50"
                                : "border border-rose-300/25 bg-rose-400/10 text-rose-200"
                          }`}
                        >
                          {asset.clauseType}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {isBlocked
                        ? `${asset.role} • Trade blocked by ${asset.clauseType}`
                        : isBlocked
                        ? `${asset.role} • Trade blocked by ${asset.clauseType}`
                        : isWarningOnly
                          ? `${asset.role} • Modified no-trade clause warning`
                          : asset.role}
                    </p>
                  </div>
                  <p>{asset.position}</p>
                  <p>{getCapDisplay(asset)}</p>
                  <p>{asset.age}</p>
                  <p className="text-right font-semibold">{formatWarValue(asset.currentWar)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function LineupRow({
  title,
  slots,
  lineupSelections,
  lineupValidPlayers,
  onUpdateLineup,
  compact = false,
  vertical = false
}: {
  title: string;
  slots: LineupSlot[];
  lineupSelections: Partial<Record<LineupSlot, string>>;
  lineupValidPlayers: Record<LineupPosition, MockAsset[]>;
  onUpdateLineup: (slot: LineupSlot, assetId: string) => void;
  compact?: boolean;
  vertical?: boolean;
}) {
  const slotCardClass = "w-full md:w-[250px]";

  return (
    <div
      className={`rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 ${
        compact ? "mx-auto w-full md:w-fit md:max-w-none" : ""
      } ${vertical ? "md:max-w-[360px]" : ""}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <div
        className={
          vertical
            ? "mt-3 flex flex-col gap-3"
            : compact
              ? "mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-center"
              : "mt-3 grid gap-3 md:grid-cols-3"
        }
      >
        {slots.map((slot) => {
          const availablePlayers = getAvailablePlayersForSlot(slot, lineupSelections, lineupValidPlayers);
          const isOptionalOpen = slot === "Scratch 3" || slot === "Scratch G";
          const isOpen = !lineupSelections[slot];
          const showOpenWarning = isOpen && !isOptionalOpen;

          return (
            <label
              key={slot}
              className={`rounded-2xl p-3 md:p-4 ${
                showOpenWarning
                  ? "border border-rose-300/45 bg-rose-400/10"
                  : "border border-white/10 bg-[#162132]"
              } ${
                vertical ? slotCardClass : compact ? slotCardClass : ""
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  showOpenWarning ? "text-rose-200" : "text-slate-400"
                }`}
              >
                {slot}
              </p>
              <select
                value={lineupSelections[slot] ?? ""}
                onChange={(event) => onUpdateLineup(slot, event.target.value)}
                className={`mt-3 w-full rounded-xl px-3 py-3 text-sm text-white outline-none ${
                  showOpenWarning
                    ? "border border-rose-300/40 bg-[#25131a] focus:border-rose-200/60"
                    : "border border-white/10 bg-[#0f1725] focus:border-white/30"
                }`}
              >
                <option value="">Open slot</option>
                {availablePlayers.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.position})
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function InjuredReserveRow({ assets }: { assets: MockAsset[] }) {
  const slots = Array.from({ length: 3 }, (_, index) => assets[index] ?? null);

  return (
    <div className="mx-auto w-full rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Injured Reserve</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {slots.map((asset, index) => (
          <div
            key={`ir-${index}`}
            className="rounded-2xl border border-white/10 bg-[#162132] p-3 md:p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              IR {index + 1}
            </p>
            {asset ? (
              <>
                <p className="mt-3 text-sm font-semibold text-white">{asset.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {asset.position} • {asset.role}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                  Locked IR Placement
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Open IR slot</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
