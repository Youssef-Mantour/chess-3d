import type { Color, PieceSymbol } from "chess.js";

// Unicode chess glyphs, used in the 2D UI (captured pieces, move list).
const GLYPHS: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};

export function pieceGlyph(type: PieceSymbol, color: Color): string {
  return GLYPHS[color][type];
}

// Standard material value, for the captured-material advantage readout.
export const MATERIAL_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};
