"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState, WsMessage } from "./types";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001/ws";

export type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export function useGameSocket(gameId: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (cancelled) return;
      setStatus("connecting");
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setStatus("open");
        ws.send(JSON.stringify({ type: "watch", gameId }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg: WsMessage = JSON.parse(ev.data);
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

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const ws = wsRef.current;
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "unwatch", gameId }));
        }
        ws.close();
      }
    };
  }, [gameId]);

  return { state, status, errorMessage };
}
