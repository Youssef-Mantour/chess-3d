# ♞ Chess 3D

An elegant, fully interactive **3D chess game** built with Next.js and three.js. Play against a built-in AI opponent or a friend across the table — all in the browser, with smooth animated pieces, dynamic lighting, and a glassmorphism UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![three.js](https://img.shields.io/badge/three.js-r3f-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## Features

- **Two ways to play**
  - **Single player** — challenge the built-in AI. Choose your color (White or Black) and one of three difficulty levels.
  - **Two players** — local pass-and-play on the same device.
- **Real 3D board** — orbit to rotate, scroll to zoom, powered by `@react-three/fiber` + `@react-three/drei`.
- **Smooth animations** — pieces glide between squares; captured pieces fade out.
- **Full chess rules** — legal-move highlighting, castling, en passant, pawn promotion (with a piece picker), check / checkmate / stalemate and all draw conditions, courtesy of [`chess.js`](https://github.com/jhlywa/chess.js).
- **AI engine** — negamax search with alpha-beta pruning, material + piece-square-table evaluation. Difficulty maps to search depth (Easy / Medium / Hard).
- **Polished UI** — move history in algebraic notation, captured-material tracker with advantage, check indicator, undo, restart, board flip, and hint toggle.
- **Responsive & self-contained** — procedurally generated 3D pieces (no external model assets to download).

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| 3D | three.js via `@react-three/fiber` and `@react-three/drei` |
| Chess rules | `chess.js` |
| State | `zustand` |
| Styling | Tailwind CSS |

## Getting started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm start
```

## How to play

1. Pick **Single player** or **Two players** on the start screen (and, for single player, your color and difficulty).
2. **Click a piece** to select it — its legal destination squares light up (dots for moves, rings for captures).
3. **Click a highlighted square** to move there. Promotions prompt you to choose a piece.
4. Use the side panel to **undo**, **restart**, **flip** the board, toggle **hints**, or return to the **menu**.
5. Drag anywhere on the board to rotate the camera; scroll to zoom.

## Project structure

```
app/                 # Next.js App Router entry (layout, page, global styles)
components/
  GameShell.tsx      # Game layout: 3D canvas + side panels + modals
  scene/             # three.js scene: board, pieces, procedural geometry
  ui/                # Menu, move history, captured pieces, controls, modals
lib/
  chessStore.ts      # zustand store — game state & piece tracking
  ai/                # negamax engine + evaluation
  coords.ts          # square <-> 3D position helpers
  pieceGlyphs.ts     # unicode piece glyphs for the 2D UI
```

## License

MIT
