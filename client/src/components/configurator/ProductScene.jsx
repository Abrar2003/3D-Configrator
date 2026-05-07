// src/components/configurator/ProductScene.jsx

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";
import TableAssembly from "./TableAssembly";

const canvasThemes = {
  light: {
    frameClassName:
      "bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#eef2f7_42%,_#d4d4d8_100%)]",
    canvasBackground:
      "radial-gradient(circle at top, #ffffff 0%, #eef2f7 42%, #d4d4d8 100%)",
    ambientLight: 1.1,
    directionalLight: 2.6,
    directionalLightColor: "#fff8ef",
    shadowOpacity: 0.28,
    loaderClassName: "bg-white/90 text-neutral-900 shadow-lg shadow-black/10",
  },
  dark: {
    frameClassName:
      "bg-[radial-gradient(circle_at_top,_#4b5563_0%,_#1f2937_40%,_#09090b_100%)]",
    canvasBackground:
      "radial-gradient(circle at top, #4b5563 0%, #1f2937 40%, #09090b 100%)",
    ambientLight: 0.75,
    directionalLight: 2.2,
    directionalLightColor: "#f8f0df",
    shadowOpacity: 0.45,
    loaderClassName:
      "bg-neutral-950/85 text-white shadow-lg shadow-black/40 ring-1 ring-white/10",
  },
};

function Loader({ theme }) {
  return (
    <Html center>
      <div
        className={`rounded-xl px-4 py-2 text-sm font-medium ${theme.loaderClassName}`}
      >
        Loading 3D model...
      </div>
    </Html>
  );
}

export default function ProductScene({
  selectedTop,
  selectedLegs,
  backgroundMode = "light",
}) {
  const theme = canvasThemes[backgroundMode] ?? canvasThemes.light;

  return (
    <div
      className={`h-[60vh] min-h-[420px] w-full overflow-hidden rounded-3xl lg:h-full lg:min-h-0 ${theme.frameClassName}`}
    >
      <Canvas
        camera={{ position: [4, 2.6, 5], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: theme.canvasBackground }}
      >
        <ambientLight intensity={theme.ambientLight} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={theme.directionalLight}
          color={theme.directionalLightColor}
        />

        <Suspense fallback={<Loader theme={theme} />}>
          {selectedTop && selectedLegs && (
            <TableAssembly
              selectedTop={selectedTop}
              selectedLegs={selectedLegs}
              topGap={0}
            />
          )}

          <Environment preset="studio" />

          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={theme.shadowOpacity}
            scale={8}
            blur={2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          target={[0, 0.8, 0]}
          enablePan={false}
          enableDamping
          minDistance={2.5}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
