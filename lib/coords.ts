// Coordinate helpers: mapping chess squares (e.g. "e4") to 3D world positions.
// Board is centered at the origin, square size = 1 unit.
// Files a..h map to x = -3.5 .. 3.5 ; ranks 1..8 map to z = 3.5 .. -3.5.
// So white's back rank (rank 1) sits toward +z (near the default camera).

export const SQUARE_SIZE = 1;
export const BOARD_HALF = 3.5;

export type FileRank = { file: number; rank: number };

/** Parse "e4" -> { file: 4, rank: 3 } (0-indexed). */
export function parseSquare(square: string): FileRank {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0
  const rank = square.charCodeAt(1) - 49; // '1' -> 0
  return { file, rank };
}

/** Build "e4" from 0-indexed file/rank. */
export function toSquare(file: number, rank: number): string {
  return String.fromCharCode(97 + file) + String.fromCharCode(49 + rank);
}

export function fileToX(file: number): number {
  return file - BOARD_HALF;
}

export function rankToZ(rank: number): number {
  return BOARD_HALF - rank;
}

/** World-space [x, y, z] for the center of a square, at board surface y=0. */
export function squareToPosition(square: string): [number, number, number] {
  const { file, rank } = parseSquare(square);
  return [fileToX(file), 0, rankToZ(rank)];
}

/** All 64 square names, a1..h8. */
export const ALL_SQUARES: string[] = (() => {
  const out: string[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      out.push(toSquare(f, r));
    }
  }
  return out;
})();

/** Is a square light-colored? (a1 is dark) */
export function isLightSquare(square: string): boolean {
  const { file, rank } = parseSquare(square);
  return (file + rank) % 2 === 1;
}
