import type { PieceSymbol } from "chess.js";

// Each chess piece is composed from a small set of primitive meshes. Keeping the
// design geometric/minimalist makes it look clean and modern while staying fully
// procedural (no external 3D model assets to download).

export type PrimKind = "cylinder" | "sphere" | "box" | "torus" | "cone";

export interface Prim {
  kind: PrimKind;
  // args per THREE geometry constructor:
  //  cylinder: [radiusTop, radiusBottom, height, radialSegments]
  //  sphere:   [radius, widthSeg, heightSeg]
  //  box:      [width, height, depth]
  //  torus:    [radius, tube, radialSeg, tubularSeg]
  //  cone:     [radius, height, radialSeg]
  args: number[];
  pos: [number, number, number];
  rot?: [number, number, number];
}

// Shared foot / base used by every piece.
function foot(): Prim[] {
  return [
    { kind: "cylinder", args: [0.3, 0.34, 0.12, 32], pos: [0, 0.06, 0] },
    { kind: "torus", args: [0.3, 0.03, 12, 32], pos: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0] },
  ];
}

function battlements(y: number, r: number): Prim[] {
  const out: Prim[] = [];
  const count = 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push({
      kind: "box",
      args: [0.08, 0.1, 0.08],
      pos: [Math.cos(a) * r, y, Math.sin(a) * r],
    });
  }
  return out;
}

function crownPoints(y: number, r: number, count: number): Prim[] {
  const out: Prim[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push({ kind: "sphere", args: [0.055, 12, 12], pos: [Math.cos(a) * r, y, Math.sin(a) * r] });
  }
  out.push({ kind: "sphere", args: [0.06, 12, 12], pos: [0, y + 0.04, 0] });
  return out;
}

const PAWN: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.1, 0.22, 0.2, 24], pos: [0, 0.22, 0] },
  { kind: "torus", args: [0.11, 0.03, 12, 24], pos: [0, 0.34, 0], rot: [Math.PI / 2, 0, 0] },
  { kind: "sphere", args: [0.16, 24, 24], pos: [0, 0.52, 0] },
];

const ROOK: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.2, 0.24, 0.34, 24], pos: [0, 0.29, 0] },
  { kind: "cylinder", args: [0.26, 0.22, 0.1, 24], pos: [0, 0.51, 0] },
  ...battlements(0.6, 0.19),
];

const KNIGHT: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.18, 0.24, 0.26, 24], pos: [0, 0.25, 0] },
  // stylized horse head from a few tilted blocks
  { kind: "box", args: [0.18, 0.34, 0.2], pos: [0, 0.52, 0.02], rot: [0.35, 0, 0] },
  { kind: "box", args: [0.16, 0.14, 0.26], pos: [0, 0.62, 0.14], rot: [0.5, 0, 0] },
  { kind: "box", args: [0.05, 0.12, 0.05], pos: [-0.06, 0.74, -0.04], rot: [-0.2, 0, 0] },
  { kind: "box", args: [0.05, 0.12, 0.05], pos: [0.06, 0.74, -0.04], rot: [-0.2, 0, 0] },
];

const BISHOP: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.13, 0.24, 0.32, 24], pos: [0, 0.28, 0] },
  { kind: "torus", args: [0.13, 0.03, 12, 24], pos: [0, 0.44, 0], rot: [Math.PI / 2, 0, 0] },
  { kind: "sphere", args: [0.15, 24, 24], pos: [0, 0.57, 0] },
  { kind: "sphere", args: [0.055, 16, 16], pos: [0, 0.73, 0] },
];

const QUEEN: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.14, 0.24, 0.46, 24], pos: [0, 0.35, 0] },
  { kind: "torus", args: [0.15, 0.03, 12, 24], pos: [0, 0.59, 0], rot: [Math.PI / 2, 0, 0] },
  { kind: "cylinder", args: [0.2, 0.16, 0.08, 24], pos: [0, 0.66, 0] },
  ...crownPoints(0.76, 0.16, 8),
];

const KING: Prim[] = [
  ...foot(),
  { kind: "cylinder", args: [0.15, 0.24, 0.5, 24], pos: [0, 0.37, 0] },
  { kind: "torus", args: [0.16, 0.03, 12, 24], pos: [0, 0.63, 0], rot: [Math.PI / 2, 0, 0] },
  { kind: "cylinder", args: [0.19, 0.17, 0.1, 24], pos: [0, 0.7, 0] },
  // cross
  { kind: "box", args: [0.07, 0.24, 0.07], pos: [0, 0.9, 0] },
  { kind: "box", args: [0.18, 0.07, 0.07], pos: [0, 0.9, 0] },
];

export const PIECE_PRIMS: Record<PieceSymbol, Prim[]> = {
  p: PAWN,
  r: ROOK,
  n: KNIGHT,
  b: BISHOP,
  q: QUEEN,
  k: KING,
};

// Approximate silhouette height per piece — used to scale selection glow, etc.
export const PIECE_HEIGHT: Record<PieceSymbol, number> = {
  p: 0.68,
  r: 0.65,
  n: 0.8,
  b: 0.78,
  q: 0.82,
  k: 0.97,
};
