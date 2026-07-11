"use client";

import { useChessStore } from "@/lib/chessStore";
import Piece from "./Piece";

export default function Pieces() {
  const pieces = useChessStore((s) => s.pieces);
  const fadingPieces = useChessStore((s) => s.fadingPieces);
  const selected = useChessStore((s) => s.selected);
  const selectSquare = useChessStore((s) => s.selectSquare);
  const clearFading = useChessStore((s) => s.clearFading);

  return (
    <group>
      {pieces.map((p) => (
        <Piece
          key={p.id}
          type={p.type}
          color={p.color}
          square={p.square}
          selected={selected === p.square}
          onClick={selectSquare}
        />
      ))}
      {fadingPieces.map((p) => (
        <Piece
          key={`fade-${p.id}`}
          type={p.type}
          color={p.color}
          square={p.square}
          fading
          onFadeDone={() => clearFading(p.id)}
        />
      ))}
    </group>
  );
}
