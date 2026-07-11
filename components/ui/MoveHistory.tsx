"use client";

import { useEffect, useRef } from "react";
import { useChessStore } from "@/lib/chessStore";

export default function MoveHistory() {
  const history = useChessStore((s) => s.history);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length]);

  const rows: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      white: history[i]?.san,
      black: history[i + 1]?.san,
    });
  }

  return (
    <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl">
      <div className="px-4 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-white/40">
        Moves
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {rows.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-white/30">
            No moves yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.num} className="odd:bg-white/[0.03]">
                  <td className="w-8 py-1 pl-2 pr-1 text-right font-mono text-xs text-white/30">
                    {r.num}.
                  </td>
                  <td className="py-1 pl-2 font-mono text-white/85">{r.white}</td>
                  <td className="py-1 pl-2 font-mono text-white/85">{r.black ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
