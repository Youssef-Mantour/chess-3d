import { Chess, type Move } from "chess.js";
import { evaluateBoard } from "./evaluate";

export type Difficulty = "easy" | "medium" | "hard";

const DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// How much random noise to add to root move scores, to keep easy games varied
// and non-deterministic. Higher = more mistakes / variety.
const RANDOMNESS: Record<Difficulty, number> = {
  easy: 90,
  medium: 30,
  hard: 0,
};

const MATE_SCORE = 1_000_000;

// Order moves so captures/promotions are searched first — improves alpha-beta
// pruning substantially.
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a));
}

function scoreMove(m: Move): number {
  let s = 0;
  if (m.captured) s += 10;
  if (m.promotion) s += 8;
  if (m.san.includes("+")) s += 1;
  return s;
}

// Negamax with alpha-beta. Returns score from the perspective of the side to move.
function negamax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      // Side to move is checkmated -> very bad for it. Prefer faster mates.
      return -MATE_SCORE - depth;
    }
    return 0; // stalemate / draw
  }
  if (depth === 0) {
    const evalWhite = evaluateBoard(game);
    return game.turn() === "w" ? evalWhite : -evalWhite;
  }

  const moves = orderMoves(game.moves({ verbose: true }) as Move[]);
  let best = -Infinity;
  for (const move of moves) {
    game.move(move);
    const score = -negamax(game, depth - 1, -beta, -alpha);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break; // beta cutoff
  }
  return best;
}

/**
 * Choose the best move for the side to move in the given FEN position.
 * Returns the verbose Move, or null if no legal moves exist.
 */
export function findBestMove(fen: string, difficulty: Difficulty): Move | null {
  const game = new Chess(fen);
  const moves = orderMoves(game.moves({ verbose: true }) as Move[]);
  if (moves.length === 0) return null;

  const depth = DEPTH[difficulty];
  const noise = RANDOMNESS[difficulty];

  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    game.move(move);
    let score = -negamax(game, depth - 1, -Infinity, Infinity);
    game.undo();
    if (noise > 0) score += (Math.random() * 2 - 1) * noise;

    if (score > bestScore + 1e-6) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) <= 1e-6) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
