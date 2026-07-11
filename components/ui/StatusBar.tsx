"use client";

import { useChessStore } from "@/lib/chessStore";

export default function StatusBar() {
  const turn = useChessStore((s) => s.turn);
  const isCheck = useChessStore((s) => s.isCheck);
  const gameOver = useChessStore((s) => s.gameOver);
  const result = useChessStore((s) => s.result);
  const mode = useChessStore((s) => s.mode);
  const humanColor = useChessStore((s) => s.humanColor);
  const aiThinking = useChessStore((s) => s.aiThinking);

  const turnLabel = turn === "w" ? "White" : "Black";
  const youAre =
    mode === "1p" ? (turn === humanColor ? "Your move" : "Computer") : `${turnLabel} to move`;

  return (
    <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block h-4 w-4 rounded-full border ${
            turn === "w"
              ? "border-black/20 bg-white"
              : "border-white/20 bg-neutral-800"
          }`}
        />
        <div>
          <div className="text-sm font-semibold text-white">
            {gameOver ? "Game over" : youAre}
          </div>
          <div className="text-xs text-white/50">
            {gameOver
              ? result
              : aiThinking
                ? "Computer is thinking…"
                : isCheck
                  ? "Check!"
                  : mode === "1p"
                    ? "Single player"
                    : "Two players"}
          </div>
        </div>
      </div>
      {isCheck && !gameOver && (
        <span className="animate-pulse rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
          CHECK
        </span>
      )}
    </div>
  );
}
