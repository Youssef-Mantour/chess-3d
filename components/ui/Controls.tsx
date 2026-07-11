"use client";

import { useChessStore } from "@/lib/chessStore";

function IconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "bg-amber-400/90 text-neutral-900"
          : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      <span className="text-base leading-none">{children}</span>
      {label}
    </button>
  );
}

export default function Controls() {
  const undo = useChessStore((s) => s.undo);
  const restart = useChessStore((s) => s.restart);
  const toggleFlip = useChessStore((s) => s.toggleFlip);
  const toggleHints = useChessStore((s) => s.toggleHints);
  const backToMenu = useChessStore((s) => s.backToMenu);
  const showHints = useChessStore((s) => s.showHints);
  const aiThinking = useChessStore((s) => s.aiThinking);
  const historyLen = useChessStore((s) => s.history.length);

  return (
    <div className="glass flex gap-2 rounded-2xl p-2">
      <IconButton label="Undo" onClick={undo} disabled={aiThinking || historyLen === 0}>
        ↶
      </IconButton>
      <IconButton label="Restart" onClick={restart}>
        ⟳
      </IconButton>
      <IconButton label="Flip" onClick={toggleFlip}>
        ⇅
      </IconButton>
      <IconButton label="Hints" onClick={toggleHints} active={showHints}>
        ◎
      </IconButton>
      <IconButton label="Menu" onClick={backToMenu}>
        ☰
      </IconButton>
    </div>
  );
}
