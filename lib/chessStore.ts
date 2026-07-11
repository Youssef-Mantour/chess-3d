import { create } from "zustand";
import { Chess, type Color, type PieceSymbol, type Move } from "chess.js";
import { findBestMove, type Difficulty } from "./ai/engine";

export type GameMode = "1p" | "2p";
export type Screen = "menu" | "game";

export interface TrackedPiece {
  id: number;
  square: string;
  type: PieceSymbol;
  color: Color;
}

export interface HistoryEntry {
  san: string;
  color: Color;
}

// A single mutable chess.js game acts as the source of truth. We keep our own
// id-tagged piece list alongside it so the 3D layer can animate pieces gliding
// between squares (stable ids => stable React keys => tween from old position).
let game = new Chess();
let nextId = 1;

function buildPieces(g: Chess): TrackedPiece[] {
  const board = g.board(); // row 0 = rank 8
  const pieces: TrackedPiece[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;
      pieces.push({ id: nextId++, square: p.square, type: p.type, color: p.color });
    }
  }
  return pieces;
}

function findKingSquare(g: Chess, color: Color): string | null {
  const board = g.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (p && p.type === "k" && p.color === color) return p.square;
    }
  }
  return null;
}

// Rook origin/target squares for the two castling moves, keyed by color+side.
function castleRookMove(color: Color, side: "k" | "q"): { from: string; to: string } {
  const rank = color === "w" ? "1" : "8";
  return side === "k"
    ? { from: "h" + rank, to: "f" + rank }
    : { from: "a" + rank, to: "d" + rank };
}

// Apply a verbose move to the tracked-piece list, returning the new active list
// plus any pieces that were captured (for a fade-out animation).
function advancePieces(
  pieces: TrackedPiece[],
  move: Move
): { next: TrackedPiece[]; captured: TrackedPiece[] } {
  const next = pieces.map((p) => ({ ...p }));
  const captured: TrackedPiece[] = [];

  // Determine the square of a captured piece (en passant differs from `to`).
  if (move.captured) {
    let capSquare = move.to;
    if (move.flags.includes("e")) {
      // en passant: captured pawn sits on the moving pawn's destination file,
      // origin rank.
      capSquare = move.to[0] + move.from[1];
    }
    const idx = next.findIndex((p) => p.square === capSquare);
    if (idx !== -1) {
      captured.push(next[idx]);
      next.splice(idx, 1);
    }
  }

  // Move the primary piece.
  const moving = next.find((p) => p.square === move.from);
  if (moving) {
    moving.square = move.to;
    if (move.promotion) moving.type = move.promotion;
  }

  // Move the rook on castling.
  if (move.flags.includes("k") || move.flags.includes("q")) {
    const side = move.flags.includes("k") ? "k" : "q";
    const rk = castleRookMove(move.color, side);
    const rook = next.find((p) => p.square === rk.from);
    if (rook) rook.square = rk.to;
  }

  return { next, captured };
}

function describeResult(g: Chess): string | null {
  if (!g.isGameOver()) return null;
  if (g.isCheckmate()) {
    const winner = g.turn() === "w" ? "Black" : "White";
    return `Checkmate — ${winner} wins`;
  }
  if (g.isStalemate()) return "Stalemate — draw";
  if (g.isThreefoldRepetition()) return "Draw by repetition";
  if (g.isInsufficientMaterial()) return "Draw — insufficient material";
  if (g.isDraw()) return "Draw — 50-move rule";
  return "Draw";
}

// Captured material, derived from full game history (robust across undo).
function computeCaptured(g: Chess): { byWhite: PieceSymbol[]; byBlack: PieceSymbol[] } {
  const byWhite: PieceSymbol[] = [];
  const byBlack: PieceSymbol[] = [];
  for (const m of g.history({ verbose: true }) as Move[]) {
    if (!m.captured) continue;
    if (m.color === "w") byWhite.push(m.captured);
    else byBlack.push(m.captured);
  }
  return { byWhite, byBlack };
}

interface DerivedState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  gameOver: boolean;
  result: string | null;
  checkedKing: string | null;
  history: HistoryEntry[];
  capturedByWhite: PieceSymbol[];
  capturedByBlack: PieceSymbol[];
}

function derive(g: Chess): DerivedState {
  const captured = computeCaptured(g);
  return {
    fen: g.fen(),
    turn: g.turn(),
    isCheck: g.isCheck(),
    gameOver: g.isGameOver(),
    result: describeResult(g),
    checkedKing: g.isCheck() ? findKingSquare(g, g.turn()) : null,
    history: (g.history({ verbose: true }) as Move[]).map((m) => ({
      san: m.san,
      color: m.color,
    })),
    capturedByWhite: captured.byWhite,
    capturedByBlack: captured.byBlack,
  };
}

interface ChessState extends DerivedState {
  screen: Screen;
  mode: GameMode;
  humanColor: Color;
  difficulty: Difficulty;

  pieces: TrackedPiece[];
  fadingPieces: TrackedPiece[];

  selected: string | null;
  legalTargets: string[];
  lastMove: { from: string; to: string } | null;
  pendingPromotion: { from: string; to: string } | null;
  aiThinking: boolean;
  showHints: boolean;
  flipped: boolean;

  startGame: (mode: GameMode, humanColor: Color, difficulty: Difficulty) => void;
  selectSquare: (square: string) => void;
  choosePromotion: (piece: PieceSymbol) => void;
  cancelPromotion: () => void;
  undo: () => void;
  restart: () => void;
  backToMenu: () => void;
  toggleHints: () => void;
  toggleFlip: () => void;
  clearFading: (id: number) => void;
}

export const useChessStore = create<ChessState>((set, get) => {
  // Whether the side to move is the AI in the current configuration.
  function aiToMove(): boolean {
    const s = get();
    return s.mode === "1p" && !s.gameOver && s.turn !== s.humanColor;
  }

  function maybeTriggerAI() {
    if (!aiToMove()) return;
    set({ aiThinking: true, selected: null, legalTargets: [] });
    const { fen, difficulty } = get();
    // Defer so the UI can paint the "thinking" state before the (blocking) search.
    setTimeout(() => {
      const move = findBestMove(fen, difficulty);
      if (!move) {
        set({ aiThinking: false });
        return;
      }
      applyMove({ from: move.from, to: move.to, promotion: move.promotion });
      set({ aiThinking: false });
    }, 260);
  }

  function applyMove(input: { from: string; to: string; promotion?: PieceSymbol }) {
    let move: Move;
    try {
      move = game.move(input) as Move;
    } catch {
      return; // illegal — ignore
    }
    const { next, captured } = advancePieces(get().pieces, move);
    set((s) => ({
      pieces: next,
      fadingPieces: [...s.fadingPieces, ...captured],
      lastMove: { from: move.from, to: move.to },
      selected: null,
      legalTargets: [],
      ...derive(game),
    }));
    maybeTriggerAI();
  }

  function reset(fresh: Chess) {
    game = fresh;
    set({
      pieces: buildPieces(game),
      fadingPieces: [],
      selected: null,
      legalTargets: [],
      lastMove: null,
      pendingPromotion: null,
      aiThinking: false,
      ...derive(game),
    });
  }

  return {
    screen: "menu",
    mode: "2p",
    humanColor: "w",
    difficulty: "medium",

    pieces: buildPieces(game),
    fadingPieces: [],
    selected: null,
    legalTargets: [],
    lastMove: null,
    pendingPromotion: null,
    aiThinking: false,
    showHints: true,
    flipped: false,
    ...derive(game),

    startGame: (mode, humanColor, difficulty) => {
      set({ screen: "game", mode, humanColor, difficulty, flipped: humanColor === "b" });
      reset(new Chess());
      maybeTriggerAI();
    },

    selectSquare: (square) => {
      const s = get();
      if (s.gameOver || s.pendingPromotion || s.aiThinking) return;
      if (s.mode === "1p" && s.turn !== s.humanColor) return;

      // If a legal target of the current selection was clicked, move there.
      if (s.selected && s.legalTargets.includes(square)) {
        const isPromotion = (game.moves({ square: s.selected as never, verbose: true }) as Move[]).some(
          (m) => m.to === square && m.promotion
        );
        if (isPromotion) {
          set({ pendingPromotion: { from: s.selected, to: square }, selected: null, legalTargets: [] });
        } else {
          applyMove({ from: s.selected, to: square });
        }
        return;
      }

      const piece = game.get(square as never);
      if (piece && piece.color === s.turn) {
        const targets = (game.moves({ square: square as never, verbose: true }) as Move[]).map(
          (m) => m.to
        );
        set({ selected: square, legalTargets: targets });
      } else {
        set({ selected: null, legalTargets: [] });
      }
    },

    choosePromotion: (piece) => {
      const p = get().pendingPromotion;
      if (!p) return;
      set({ pendingPromotion: null });
      applyMove({ from: p.from, to: p.to, promotion: piece });
    },

    cancelPromotion: () => set({ pendingPromotion: null }),

    undo: () => {
      const s = get();
      if (s.aiThinking || s.pendingPromotion) return;
      if (game.history().length === 0) return;
      game.undo();
      // In 1p, also undo the AI's reply so control returns to the human.
      if (s.mode === "1p" && game.history().length > 0 && game.turn() !== s.humanColor) {
        game.undo();
      }
      const hist = game.history({ verbose: true }) as Move[];
      const last = hist[hist.length - 1];
      set({
        pieces: buildPieces(game),
        fadingPieces: [],
        selected: null,
        legalTargets: [],
        lastMove: last ? { from: last.from, to: last.to } : null,
        ...derive(game),
      });
    },

    restart: () => {
      const s = get();
      reset(new Chess());
      set({ flipped: s.humanColor === "b" && s.mode === "1p" });
      maybeTriggerAI();
    },

    backToMenu: () => set({ screen: "menu" }),
    toggleHints: () => set((s) => ({ showHints: !s.showHints })),
    toggleFlip: () => set((s) => ({ flipped: !s.flipped })),
    clearFading: (id) =>
      set((s) => ({ fadingPieces: s.fadingPieces.filter((p) => p.id !== id) })),
  };
});
