import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
} from "@react-three/drei";
import TableAssembly from "./TableAssembly";

function Loader() {
  return (
    <Html center>
      <div className="rounded-full border border-black/10 bg-white/92 px-4 py-2 text-sm font-medium text-neutral-700 shadow-lg shadow-black/5 backdrop-blur">
        Loading 3D model...
      </div>
    </Html>
  );
}

export default function ProductScene({ selectedTop, selectedLegs }) {
  return (
    <div className="h-full min-h-[520px] w-full bg-[radial-gradient(circle_at_top,_#faf8f2_0%,_#efebe2_52%,_#e4ddd0_100%)]">
      <Canvas
        shadows
        camera={{ position: [4.5, 2.8, 5.5], fov: 33 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.8;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={["#efebe2"]} />
        <ambientLight intensity={0.28} />
        <hemisphereLight
          intensity={0.22}
          color="#f4f0e6"
          groundColor="#b8af9f"
        />
        <directionalLight
          castShadow
          position={[5.6, 7.4, 3.2]}
          intensity={0.92}
          color="#f4e7d4"
          shadow-bias={-0.00008}
          shadow-normalBias={0.028}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={20}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight
          position={[-4.5, 2.8, -3.2]}
          intensity={0.1}
          color="#c8d0d8"
        />

        <Suspense fallback={<Loader />}>
          <TableAssembly
            selectedTop={selectedTop}
            selectedLegs={selectedLegs}
            topGap={0}
          />

          <Environment preset="apartment" blur={0.9} />

          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.4}
            scale={11}
            blur={2.35}
            far={5.2}
            resolution={1024}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={2.5}
          maxDistance={9}
          target={[0, 0.9, 0]}
        />
      </Canvas>
    </div>
  );
}
