"use client";

import { useChessStore } from "@/lib/chessStore";
import ModeSelect from "@/components/ui/ModeSelect";
import GameShell from "@/components/GameShell";

export default function Home() {
  const screen = useChessStore((s) => s.screen);
  return screen === "menu" ? <ModeSelect /> : <GameShell />;
}
