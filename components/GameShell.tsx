"use client";

import dynamic from "next/dynamic";
import StatusBar from "./ui/StatusBar";
import CapturedPieces from "./ui/CapturedPieces";
import MoveHistory from "./ui/MoveHistory";
import Controls from "./ui/Controls";
import GameOverModal from "./ui/GameOverModal";
import PromotionChooser from "./ui/PromotionChooser";

// three.js can't render on the server — load the scene client-side only.
const ChessScene = dynamic(() => import("./scene/ChessScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-white/40">
      <div className="animate-pulse text-sm">Loading board…</div>
    </div>
  ),
});

export default function GameShell() {
  return (
    <div className="flex h-[100dvh] w-full flex-col gap-3 p-3 lg:flex-row">
      {/* Board */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/5 bg-black/20">
        <ChessScene />
        <PromotionChooser />
        <GameOverModal />
      </div>

      {/* Side panel */}
      <aside className="flex shrink-0 flex-col gap-3 lg:h-full lg:w-[340px]">
        <StatusBar />
        <CapturedPieces />
        <div className="hidden min-h-0 flex-1 lg:flex">
          <MoveHistory />
        </div>
        <Controls />
      </aside>
    </div>
  );
}
