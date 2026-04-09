import { readFile } from "fs/promises";
import path from "path";

type MetricRow = Record<string, string>;

type PlayerMetricData = {
  warByPlayerTeam: Map<string, number>;
  scoreByPlayerTeam: Map<string, number>;
};

const WAR_PATH = path.join(process.cwd(), "data", "WAR.csv");
const SCORE_PATH = path.join(process.cwd(), "data", "final_trade_values_with_goalies.csv");

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildKey(name: string, team: string) {
  return `${normalizeName(name)}|${team.trim().toUpperCase()}`;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(content: string) {
  const lines = content.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: MetricRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

function parseNumber(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

let metricCache: Promise<PlayerMetricData> | null = null;

export async function getPlayerMetricData() {
  if (metricCache) {
    return metricCache;
  }

  metricCache = (async () => {
    const [warCsv, scoreCsv] = await Promise.all([
      readFile(WAR_PATH, "utf8").catch(() => ""),
      readFile(SCORE_PATH, "utf8").catch(() => "")
    ]);

    const warByPlayerTeam = new Map<string, number>();
    const scoreByPlayerTeam = new Map<string, number>();

    for (const row of parseCsv(warCsv)) {
      const player = row.Player?.trim();
      const team = row.Team?.trim();
      const war = parseNumber(row.WAR ?? "");

      if (!player || !team || war === null) {
        continue;
      }

      warByPlayerTeam.set(buildKey(player, team), war);
    }

    for (const row of parseCsv(scoreCsv)) {
      const player = row.player_name?.trim();
      const team = row.team?.trim();
      const score = parseNumber(row.score ?? "");

      if (!player || !team || score === null) {
        continue;
      }

      scoreByPlayerTeam.set(buildKey(player, team), score);
    }

    return { warByPlayerTeam, scoreByPlayerTeam };
  })();

  return metricCache;
}

export function getMetricKey(name: string, team: string) {
  return buildKey(name, team);
}
