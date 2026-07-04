"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState, WsMessage } from "./types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001/ws";

// サーバーは20秒間隔でheartbeatを送ってくる。1回の欠落は許容しつつ、
// 2回分（約45秒）音沙汰が無ければ「見た目は繋がっているが実は死んでいる」
// 状態とみなして強制的に繋ぎ直す。
const STALE_MS = 45000;
const STALE_CHECK_INTERVAL_MS = 10000;

export type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export function useGameSocket(gameId: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let staleCheckTimer: ReturnType<typeof setInterval> | null = null;
    let lastMessageAt = Date.now();

    function teardown(ws: WebSocket | null) {
      if (!ws) return;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "unwatch", gameId }));
        } catch {
          // 送信できなければ黙って無視（どうせ閉じるだけなので）
        }
      }
      ws.close();
    }

    function connect() {
      if (cancelled) return;
      setStatus("connecting");
      lastMessageAt = Date.now();

      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setStatus("open");
        lastMessageAt = Date.now();
        ws.send(JSON.stringify({ type: "watch", gameId }));
      };

      ws.onmessage = (ev) => {
        lastMessageAt = Date.now();
        try {
          const msg: WsMessage = JSON.parse(ev.data);
          if (msg.type === "heartbeat") return; // 生存確認用。データとしては使わない
          if (msg.gameId !== gameId) return;
          if (msg.type === "update") {
            setState(msg.state);
            setErrorMessage(null);
          } else if (msg.type === "error") {
            setErrorMessage(msg.message);
          }
        } catch {
          // 無視: 想定外のメッセージ形式
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("closed");
        // 少し待って再接続を試みる（サーバー再起動やネットワーク瞬断への対策）
        reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        if (cancelled) return;
        setStatus("error");
      };
    }

    function forceReconnect() {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      teardown(wsRef.current);
      connect();
    }

    connect();

    // 見た目は「open」のままメッセージが来なくなる半死に状態を検知する。
    // サーバーからのheartbeatも含めて一定時間何も届かなければ繋ぎ直す。
    staleCheckTimer = setInterval(() => {
      if (cancelled) return;
      if (Date.now() - lastMessageAt > STALE_MS) {
        forceReconnect();
      }
    }, STALE_CHECK_INTERVAL_MS);

    // スマホの画面ロックやタブの非表示化で接続が実質的に止まっていることがあるため、
    // 画面が再び見えるようになった瞬間に、生きているか確認して怪しければ繋ぎ直す
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      const ws = wsRef.current;
      const looksDead = !ws || ws.readyState !== WebSocket.OPEN;
      const isStale = Date.now() - lastMessageAt > STALE_MS;
      if (looksDead || isStale) {
        forceReconnect();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (staleCheckTimer) clearInterval(staleCheckTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      teardown(wsRef.current);
    };
  }, [gameId]);

  return { state, status, errorMessage };
}
