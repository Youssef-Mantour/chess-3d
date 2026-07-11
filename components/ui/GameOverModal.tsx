"use client";

import { useChessStore } from "@/lib/chessStore";

export default function GameOverModal() {
  const gameOver = useChessStore((s) => s.gameOver);
  const result = useChessStore((s) => s.result);
  const restart = useChessStore((s) => s.restart);
  const backToMenu = useChessStore((s) => s.backToMenu);

  if (!gameOver) return null;

  const isWin = result?.includes("wins");

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-[min(90vw,26rem)] rounded-3xl p-8 text-center">
        <div className="mb-3 text-5xl">{isWin ? "🏆" : "🤝"}</div>
        <h2 className="text-2xl font-bold text-white">{result}</h2>
        <p className="mt-1 text-sm text-white/50">Good game.</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={backToMenu}
            className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Main menu
          </button>
          <button
            onClick={restart}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-bold text-neutral-900 transition hover:brightness-105"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}
