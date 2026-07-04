type Props = {
  lastResult: string | null;
  pitchInfo: string | null;
};

export default function PitchTicker({ lastResult, pitchInfo }: Props) {
  if (!lastResult && !pitchInfo) {
    return (
      <div className="pitch-ticker">
        <span className="pitch-ticker-empty">まだデータがありません</span>
      </div>
    );
  }

  return (
    <div className="pitch-ticker">
      {lastResult && <span className="pitch-ticker-result">{lastResult}</span>}
      {pitchInfo && <span className="pitch-ticker-info">{pitchInfo}</span>}
    </div>
  );
}
