"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useChessStore } from "@/lib/chessStore";
import Board from "./Board";
import Pieces from "./Pieces";

export default function ChessScene() {
  const flipped = useChessStore((s) => s.flipped);
  const deselect = useChessStore((s) => s.selectSquare);

  // The Canvas is loaded via next/dynamic, so it can mount before its flex
  // container has settled its size; nudge r3f to re-measure over the first few
  // hundred ms so it picks up the final layout size.
  useEffect(() => {
    let count = 0;
    let timer: number;
    const tick = () => {
      window.dispatchEvent(new Event("resize"));
      if (++count < 6) timer = window.setTimeout(tick, 90);
    };
    timer = window.setTimeout(tick, 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 7.8, 8.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => deselect("__none__")}
    >
      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#dfe9ff", "#3a2a1e", 0.5]} />
      <directionalLight
        position={[6, 11, 6]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-7, 6, -5]} intensity={0.5} color="#8fb7ff" />
      <pointLight position={[0, 6, 0]} intensity={0.35} />

      {/* Board + pieces (rotated 180° when the board is flipped) */}
      <group rotation={[0, flipped ? Math.PI : 0, 0]}>
        <Board />
        <Pieces />
      </group>

      <ContactShadows
        position={[0, -0.32, 0]}
        opacity={0.55}
        scale={16}
        blur={2.4}
        far={6}
        resolution={1024}
        color="#000000"
      />

      <OrbitControls
        target={[0, 0.4, 0]}
        enablePan={false}
        minDistance={6}
        maxDistance={16}
        minPolarAngle={0.15}
        maxPolarAngle={1.45}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
