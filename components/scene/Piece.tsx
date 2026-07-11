"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Color, PieceSymbol } from "chess.js";
import { squareToPosition } from "@/lib/coords";
import { PIECE_PRIMS, type Prim } from "./piecesGeometry";

function PrimMesh({ prim, material }: { prim: Prim; material: THREE.Material }) {
  const geometry = useMemo(() => {
    switch (prim.kind) {
      case "cylinder":
        return new THREE.CylinderGeometry(
          prim.args[0],
          prim.args[1],
          prim.args[2],
          prim.args[3] ?? 24
        );
      case "sphere":
        return new THREE.SphereGeometry(prim.args[0], prim.args[1] ?? 24, prim.args[2] ?? 24);
      case "box":
        return new THREE.BoxGeometry(prim.args[0], prim.args[1], prim.args[2]);
      case "torus":
        return new THREE.TorusGeometry(prim.args[0], prim.args[1], prim.args[2] ?? 12, prim.args[3] ?? 24);
      case "cone":
        return new THREE.ConeGeometry(prim.args[0], prim.args[1], prim.args[2] ?? 24);
    }
  }, [prim]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={prim.pos}
      rotation={prim.rot}
      castShadow
      receiveShadow
    />
  );
}

interface PieceProps {
  type: PieceSymbol;
  color: Color;
  square: string;
  selected?: boolean;
  fading?: boolean;
  onClick?: (square: string) => void;
  onFadeDone?: () => void;
}

const WHITE = { color: "#f0e8d6", roughness: 0.42, metalness: 0.12, emissive: "#5b4a1e" };
const BLACK = { color: "#26262e", roughness: 0.5, metalness: 0.32, emissive: "#2a4a63" };

export default function Piece({
  type,
  color,
  square,
  selected = false,
  fading = false,
  onClick,
  onFadeDone,
}: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(() => {
    const spec = color === "w" ? WHITE : BLACK;
    return new THREE.MeshStandardMaterial({
      color: spec.color,
      roughness: spec.roughness,
      metalness: spec.metalness,
      emissive: new THREE.Color(spec.emissive),
      emissiveIntensity: 0,
    });
  }, [color]);

  const emissiveBase = color === "w" ? WHITE.emissive : BLACK.emissive;
  const prims = PIECE_PRIMS[type];
  const fadeStart = useRef<number | null>(null);
  const hovered = useRef(false);

  // Face knights toward the opponent.
  const baseYaw = color === "w" ? Math.PI : 0;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    if (fading) {
      if (fadeStart.current === null) fadeStart.current = 0;
      fadeStart.current += delta;
      const t = Math.min(fadeStart.current / 0.4, 1);
      const s = 1 - t;
      g.scale.setScalar(s);
      g.position.y = t * 0.35;
      g.rotation.y += delta * 4;
      if (t >= 1) onFadeDone?.();
      return;
    }

    // Glide toward the target square.
    const [tx, , tz] = squareToPosition(square);
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 12, delta);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 12, delta);
    const targetY = selected ? 0.28 : 0;
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 12, delta);

    // Selection / hover glow.
    const want = selected ? 0.9 : hovered.current ? 0.35 : 0;
    material.emissiveIntensity = THREE.MathUtils.damp(
      material.emissiveIntensity,
      want,
      10,
      delta
    );
    material.emissive.set(emissiveBase);
  });

  // Initialize at the correct square on first render.
  const initial = squareToPosition(square);

  return (
    <group
      ref={group}
      position={initial}
      rotation={[0, baseYaw, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (!fading) onClick?.(square);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "auto";
      }}
    >
      {prims.map((prim, i) => (
        <PrimMesh key={i} prim={prim} material={material} />
      ))}
    </group>
  );
}
