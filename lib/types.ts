export type ScheduleGame = {
  gameId: string;
  venue: string | null;
  teamA: string;
  teamB: string;
  pitcherA: string | null;
  pitcherB: string | null;
  time: string | null;
  status: string | null;
};

export type ScheduleResponse = {
  date: string;
  games: ScheduleGame[];
};

export type ScoreEntry = {
  team: string;
  runs: string;
  active: boolean;
};

export type Inning = {
  number: number | null;
  half: "top" | "bottom" | null;
  raw: string;
} | null;

export type Runners = {
  first: boolean;
  second: boolean;
  third: boolean;
};

export type RunnerNames = {
  first: string | null;
  second: string | null;
  third: string | null;
};

export type GameState = {
  gameId: string;
  fetchedAt: string;
  inning: Inning;
  count: { balls: number; strikes: number; outs: number };
  lastResult: string | null;
  pitchInfo: string | null;
  pitchIndex: string | null;
  battingTeam: string | null;
  runners: Runners;
  runnerNames: RunnerNames;
  score: ScoreEntry[];
};

export type WsMessage =
  | { type: "update"; gameId: string; state: GameState }
  | { type: "error"; gameId: string; message: string };
