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
      {/* Lighting — bright, even coverage so pieces read clearly from any angle */}
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#eaf1ff", "#4a3826", 0.9]} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={2.0}
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
      {/* Cool rim from behind for separation */}
      <directionalLight position={[-7, 7, -5]} intensity={0.9} color="#9fc2ff" />
      {/* Warm fill from the camera side so piece fronts aren't in shadow */}
      <directionalLight position={[0, 5, 9]} intensity={1.0} color="#fff2dc" />
      <pointLight position={[0, 7, 0]} intensity={0.6} />

      {/* Board + pieces (rotated 180° when the board is flipped) */}
      <group rotation={[0, flipped ? Math.PI : 0, 0]}>
        <Board />
        <Pieces />
      </group>

      <ContactShadows
        position={[0, -0.46, 0]}
        opacity={0.4}
        scale={16}
        blur={2.6}
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
