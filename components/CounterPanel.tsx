import type { Runners, RunnerNames, ScoreEntry } from "@/lib/types";
import { toOneChar } from "@/lib/teamAbbr";

type Props = {
  score: ScoreEntry[];
  count: { balls: number; strikes: number; outs: number };
  runners: Runners;
  runnerNames: RunnerNames;
};

/**
 * 参照サイト（BSOちゃん）の黒いカウンターパネルを再現。
 * スコアボードは「表側の攻撃チームが上段、裏側の攻撃チームが下段」の固定順で
 * 表示される慣習があり、スポナビ側のスコア表もこの順で並んでいるため、
 * score配列をそのまま上段/下段に割り当てている。
 *
 * ランナーは #base のclass（例: "b100"）から毎回そのまま取得しており、
 * 常に現在の実際の状態を反映しているため、以前のような「前回の状態を維持する」
 * フォールバック処理は不要。
 */
export default function CounterPanel({ score, count, runners, runnerNames }: Props) {
  const top = score[0];
  const bottom = score[1];

  const runnerLine = [
    runners.first && runnerNames.first && `1塁 ${runnerNames.first}`,
    runners.second && runnerNames.second && `2塁 ${runnerNames.second}`,
    runners.third && runnerNames.third && `3塁 ${runnerNames.third}`,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="counter-panel">
      <div className="counter-teams">
        <div className="counter-team-row">
          <span className="counter-team-name">
            <span className={`counter-bar${top?.active ? " is-batting" : ""}`} />
            {toOneChar(top?.team)}
          </span>
          <span className="counter-team-score">{top?.runs ?? "0"}</span>
        </div>
        <div className="counter-divider" />
        <div className="counter-team-row">
          <span className="counter-team-name">
            <span className={`counter-bar${bottom?.active ? " is-batting" : ""}`} />
            {toOneChar(bottom?.team)}
          </span>
          <span className="counter-team-score">{bottom?.runs ?? "0"}</span>
        </div>
      </div>

      <div className="counter-side">
        <div className="counter-diamond">
          <span className={`c-dot c-dot--2b${runners.second ? " is-on" : ""}`} />
          <span className={`c-dot c-dot--3b${runners.third ? " is-on" : ""}`} />
          <span className={`c-dot c-dot--1b${runners.first ? " is-on" : ""}`} />
        </div>

        <div className="counter-bso">
          <CounterRow label="B" count={count.balls} max={3} />
          <CounterRow label="S" count={count.strikes} max={2} />
          <CounterRow label="O" count={count.outs} max={2} />
        </div>
      </div>

      {runnerLine && <div className="counter-runner-names">{runnerLine}</div>}
    </div>
  );
}

function CounterRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="counter-bso-row">
      <span className="counter-bso-label">{label}</span>
      <span className="counter-bso-dots">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`c-dot${i < count ? " is-on" : ""}`} />
        ))}
      </span>
    </div>
  );
}
