# npb-live-frontend

NPBの本日の対戦カードを一覧表示し、選んだ試合のカウント・得点・直近の1球を
リアルタイムに表示するNext.jsアプリ。バックエンド（`npb-live-backend`）とセットで動作する。

デザインは、ナイターの球場に浮かぶ電光掲示板をモチーフにしている。
B/S/Oのランプ表示（`components/BsoLights.tsx`）が更新のたびに一瞬光る演出は、
実際のスコアボードのランプが切り替わる瞬間を再現したもの。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.localのAPI_BASE / WS_BASEをバックエンドのURLに合わせて編集
npm run dev
```

`http://localhost:3000` でトップページ（本日の試合一覧）が開く。試合をタップすると
`/game/[試合ID]` でライブビューに遷移し、WebSocketで購読を開始する。

## Vercelへのデプロイ

1. このディレクトリをGitHubリポジトリにpush
2. Vercelで「Import Project」
3. 環境変数に `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_WS_BASE` をRailwayのURLで設定
   （`wss://` を忘れないこと。VercelはHTTPS配信なので、混合コンテンツ回避のため
   バックエンド側もwss/https必須）

## ディレクトリ構成

```
app/
  page.tsx              本日の試合一覧
  game/[id]/page.tsx    ライブスコアボード
  globals.css           デザイントークン一式
components/
  BsoLights.tsx          B/S/Oランプ（シグネチャー要素）
  ScoreBoard.tsx         得点表示
  PitchTicker.tsx        直近の1球
lib/
  useGameSocket.ts        WebSocket購読フック
  types.ts                 バックエンドのレスポンス型
```

## 今後の拡張候補

- 走者（一塁・二塁・三塁）の表示: バックエンド側でまだセレクタを確認できていないため未実装
- イニング表示: 同上
- 応援チームだけを上部に固定表示するお気に入り機能
