"use client";

import { useState } from "react";
import type { Color } from "chess.js";
import { useChessStore, type GameMode } from "@/lib/chessStore";
import type { Difficulty } from "@/lib/ai/engine";

const DIFFICULTIES: { key: Difficulty; label: string; blurb: string }[] = [
  { key: "easy", label: "Easy", blurb: "Casual — makes mistakes" },
  { key: "medium", label: "Medium", blurb: "Thinks a couple moves ahead" },
  { key: "hard", label: "Hard", blurb: "Searches deeper, plays sharp" },
];

export default function ModeSelect() {
  const startGame = useChessStore((s) => s.startGame);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [color, setColor] = useState<Color>("w");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mb-3 text-6xl">♞</div>
          <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
            Chess&nbsp;3D
          </h1>
          <p className="mt-3 text-base text-white/50">
            An elegant 3D chessboard. Play the computer, or a friend across the table.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode("1p")}
            className={`glass group rounded-2xl p-6 text-left transition ${
              mode === "1p" ? "ring-2 ring-amber-400/80" : "hover:ring-1 hover:ring-white/20"
            }`}
          >
            <div className="mb-2 text-3xl">🤖</div>
            <div className="text-lg font-semibold text-white">Single player</div>
            <div className="text-sm text-white/50">Challenge the built-in AI</div>
          </button>

          <button
            onClick={() => setMode("2p")}
            className={`glass group rounded-2xl p-6 text-left transition ${
              mode === "2p" ? "ring-2 ring-sky-400/80" : "hover:ring-1 hover:ring-white/20"
            }`}
          >
            <div className="mb-2 text-3xl">👥</div>
            <div className="text-lg font-semibold text-white">Two players</div>
            <div className="text-sm text-white/50">Pass &amp; play, same device</div>
          </button>
        </div>

        {/* 1P options */}
        {mode === "1p" && (
          <div className="glass mt-4 space-y-5 rounded-2xl p-6">
            <div>
              <div className="mb-2 text-sm font-medium text-white/70">Play as</div>
              <div className="flex gap-3">
                {(["w", "b"] as Color[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      color === c
                        ? "bg-white text-neutral-900"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg">{c === "w" ? "♔" : "♚"}</span>
                    {c === "w" ? "White" : "Black"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white/70">Difficulty</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`rounded-xl px-3 py-3 text-left transition ${
                      difficulty === d.key
                        ? "bg-amber-400/90 text-neutral-900"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-sm font-semibold">{d.label}</div>
                    <div
                      className={`text-xs ${
                        difficulty === d.key ? "text-neutral-800/80" : "text-white/40"
                      }`}
                    >
                      {d.blurb}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Play button */}
        {mode && (
          <button
            onClick={() => startGame(mode, color, difficulty)}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 text-lg font-bold text-neutral-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.99]"
          >
            Start game
          </button>
        )}
      </div>

      <p className="relative z-10 mt-10 text-xs text-white/30">
        Drag to rotate · scroll to zoom · click a piece to move
      </p>
    </div>
  );
}
