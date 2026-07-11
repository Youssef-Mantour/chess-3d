"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useChessStore } from "@/lib/chessStore";
import { ALL_SQUARES, isLightSquare, squareToPosition } from "@/lib/coords";

const LIGHT = "#e9dcc0";
const DARK = "#6f4d34";
const FRAME = "#2c1e14";

export default function Board() {
  const selected = useChessStore((s) => s.selected);
  const legalTargets = useChessStore((s) => s.legalTargets);
  const lastMove = useChessStore((s) => s.lastMove);
  const checkedKing = useChessStore((s) => s.checkedKing);
  const showHints = useChessStore((s) => s.showHints);
  const pieces = useChessStore((s) => s.pieces);
  const selectSquare = useChessStore((s) => s.selectSquare);

  const occupied = useMemo(() => new Set(pieces.map((p) => p.square)), [pieces]);
  const targetSet = useMemo(() => new Set(legalTargets), [legalTargets]);

  return (
    <group>
      {/* Board body / frame — sits BELOW the square surface (top at y=-0.02)
          so the 64 squares on top stay fully visible as a checkerboard. */}
      <mesh position={[0, -0.24, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.2, 0.44, 9.2]} />
        <meshStandardMaterial color={FRAME} roughness={0.5} metalness={0.1} />
      </mesh>

      {ALL_SQUARES.map((sq) => {
        const [x, , z] = squareToPosition(sq);
        const light = isLightSquare(sq);
        const isSelected = sq === selected;
        const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
        const isCheck = sq === checkedKing;
        const isTarget = showHints && targetSet.has(sq);
        const isCapture = isTarget && occupied.has(sq);

        return (
          <group key={sq} position={[x, 0, z]}>
            <mesh
              position={[0, -0.05, 0]}
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                selectSquare(sq);
              }}
            >
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial
                color={light ? LIGHT : DARK}
                roughness={0.55}
                metalness={0.05}
              />
            </mesh>

            {/* Highlight overlays */}
            {isSelected && <Overlay color="#f4d03f" opacity={0.55} />}
            {isLast && !isSelected && <Overlay color="#c9e26b" opacity={0.3} />}
            {isCheck && <Overlay color="#ff4d4d" opacity={0.6} />}

            {/* Legal-move indicators */}
            {isTarget && !isCapture && (
              <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.16, 24]} />
                <meshBasicMaterial color="#2fe0c0" transparent opacity={0.75} />
              </mesh>
            )}
            {isCapture && (
              <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.36, 0.46, 28]} />
                <meshBasicMaterial color="#ff8a5b" transparent opacity={0.85} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Overlay({ color, opacity }: { color: string; opacity: number }) {
  return (
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.98, 0.98]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}
