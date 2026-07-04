"use client";

import Link from "next/link";
import { useGameSocket } from "@/lib/useGameSocket";
import CounterPanel from "@/components/CounterPanel";
import PitchTicker from "@/components/PitchTicker";

const STATUS_LABEL: Record<string, string> = {
  connecting: "接続中",
  open: "接続中・受信待機",
  closed: "切断（再接続します）",
  error: "接続エラー",
};

export default function GamePage({ params }: { params: { id: string } }) {
  const { state, status, errorMessage } = useGameSocket(params.id);

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">
          一球速報
          <small>試合ID: {params.id}</small>
        </h1>
        <Link href="/" className="back-link">
          一覧へ
        </Link>
      </div>

      {state?.inning?.raw && <div className="inning-label">{state.inning.raw}</div>}

      {state?.suspended && (
        <div className="suspended-banner">
          試合中止{state.suspendedReason ? `（${state.suspendedReason}）` : ""}
        </div>
      )}

      <CounterPanel
        score={state?.score ?? []}
        count={state?.count ?? { balls: 0, strikes: 0, outs: 0 }}
        runners={state?.runners ?? { first: false, second: false, third: false }}
        runnerNames={state?.runnerNames ?? { first: null, second: null, third: null }}
      />

      <PitchTicker lastResult={state?.lastResult ?? null} pitchInfo={state?.pitchInfo ?? null} />

      <div className={`conn-status is-${status}`}>
        <span className="conn-dot" />
        {STATUS_LABEL[status]}
      </div>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}
    </main>
  );
}
