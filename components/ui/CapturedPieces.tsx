"use client";

import type { Color, PieceSymbol } from "chess.js";
import { useChessStore } from "@/lib/chessStore";
import { MATERIAL_VALUE, pieceGlyph } from "@/lib/pieceGlyphs";

const ORDER: PieceSymbol[] = ["q", "r", "b", "n", "p"];

function sortCaptured(list: PieceSymbol[]): PieceSymbol[] {
  return [...list].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

function sum(list: PieceSymbol[]): number {
  return list.reduce((t, p) => t + MATERIAL_VALUE[p], 0);
}

/** One row: the pieces `capturer` has taken from the opponent. */
function Row({ captured, capturedColor, advantage }: {
  captured: PieceSymbol[];
  capturedColor: Color; // color of the captured pieces (opponent's color)
  advantage: number;
}) {
  return (
    <div className="flex min-h-6 items-center gap-1">
      <div className="flex flex-wrap text-xl leading-none">
        {sortCaptured(captured).map((p, i) => (
          <span key={i} className="text-white/80">
            {pieceGlyph(p, capturedColor)}
          </span>
        ))}
      </div>
      {advantage > 0 && (
        <span className="ml-1 text-xs font-semibold text-emerald-400">+{advantage}</span>
      )}
    </div>
  );
}

export default function CapturedPieces() {
  const byWhite = useChessStore((s) => s.capturedByWhite); // black pieces
  const byBlack = useChessStore((s) => s.capturedByBlack); // white pieces

  const whiteScore = sum(byWhite);
  const blackScore = sum(byBlack);
  const diff = whiteScore - blackScore;

  return (
    <div className="glass space-y-2 rounded-2xl px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-white/40">
        Captured
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-xs text-white/50">White</span>
        <Row captured={byWhite} capturedColor="b" advantage={diff > 0 ? diff : 0} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-xs text-white/50">Black</span>
        <Row captured={byBlack} capturedColor="w" advantage={diff < 0 ? -diff : 0} />
      </div>
    </div>
  );
}
