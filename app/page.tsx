"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScheduleGame, ScheduleResponse } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";

const CENTRAL = ["巨人", "DeNA", "阪神", "中日", "広島", "ヤクルト", "オイシックス"];
const PACIFIC = ["ソフトバンク", "日本ハム", "オリックス", "楽天", "西武", "ロッテ", "くふうハヤテ"];

function leagueOf(game: ScheduleGame): "central" | "pacific" | "other" {
  if (CENTRAL.includes(game.teamA) || CENTRAL.includes(game.teamB)) return "central";
  if (PACIFIC.includes(game.teamA) || PACIFIC.includes(game.teamB)) return "pacific";
  return "other";
}

function GameCard({ game }: { game: ScheduleGame }) {
  const isLive = game.status === "試合中";
  return (
    <Link href={`/game/${game.gameId}`} className="game-card">
      <div className="game-card-row">
        <div className="game-card-teams">
          {game.teamA}
          <span className="vs">vs</span>
          {game.teamB}
        </div>
        <div className="game-card-meta">
          {game.time && <span>{game.time}</span>}
          <span className={`status-pill${isLive ? " is-live" : ""}`}>
            {game.status ?? "-"}
          </span>
        </div>
      </div>
      <div className="game-card-sub">
        {game.venue ?? "球場未定"}
        {(game.pitcherA || game.pitcherB) && (
          <>
            {" ・ "}
            {game.pitcherA ?? "?"} - {game.pitcherB ?? "?"}
          </>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/games/today`);
      if (!res.ok) throw new Error("failed");
      const json: ScheduleResponse = await res.json();
      setData(json);
    } catch {
      setError("試合一覧の取得に失敗しました。バックエンドが起動しているか確認してください。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const central = data?.games.filter((g) => leagueOf(g) === "central") ?? [];
  const pacific = data?.games.filter((g) => leagueOf(g) === "pacific") ?? [];

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">
          一球速報ボード
          <small>{data?.date ?? "本日"}のカードを選択</small>
        </h1>
        <button className="back-link" onClick={load}>
          更新
        </button>
      </div>

      {loading && <p className="empty-state">読み込み中…</p>}
      {error && <p className="empty-state">{error}</p>}

      {!loading && !error && data && data.games.length === 0 && (
        <p className="empty-state">本日の試合はありません</p>
      )}

      {central.length > 0 && (
        <>
          <div className="league-label">セ・リーグ</div>
          {central.map((g) => (
            <GameCard key={g.gameId} game={g} />
          ))}
        </>
      )}

      {pacific.length > 0 && (
        <>
          <div className="league-label">パ・リーグ</div>
          {pacific.map((g) => (
            <GameCard key={g.gameId} game={g} />
          ))}
        </>
      )}
    </main>
  );
}
