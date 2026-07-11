"use client";

import type { PieceSymbol } from "chess.js";
import { useChessStore } from "@/lib/chessStore";
import { pieceGlyph } from "@/lib/pieceGlyphs";

const CHOICES: PieceSymbol[] = ["q", "r", "b", "n"];

export default function PromotionChooser() {
  const pending = useChessStore((s) => s.pendingPromotion);
  const choose = useChessStore((s) => s.choosePromotion);
  const cancel = useChessStore((s) => s.cancelPromotion);
  const turn = useChessStore((s) => s.turn); // side to move === the promoting side

  if (!pending) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={cancel}
    >
      <div
        className="glass rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-center text-sm font-medium text-white/70">
          Promote to
        </div>
        <div className="flex gap-3">
          {CHOICES.map((p) => (
            <button
              key={p}
              onClick={() => choose(p)}
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-4xl text-white transition hover:scale-105 hover:bg-white/15"
            >
              {pieceGlyph(p, turn)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
