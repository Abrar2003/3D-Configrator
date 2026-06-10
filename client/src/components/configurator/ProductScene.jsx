import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  Html,
  OrbitControls,
} from "@react-three/drei";
import { validateSofaConfiguration } from "../../utils/sofaConfig";
import SofaAssembly from "./SofaAssembly";
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

export default function ProductScene({
  product,
  selectedTop,
  selectedLegs,
  selectedModuleIds = [],
  selectedModuleEntries = [],
  selectedVariant,
  pendingSofaInsertionSlots = [],
  onSelectSofaInsertionSlot,
  collisionCheckModuleIndex,
  onRemoveCollidingSofaModule,
  panMode = false,
}) {
  const isSofa = product?.productType === "sofa";
  const sofaValidation = isSofa
    ? validateSofaConfiguration(product, selectedModuleIds)
    : { valid: true, message: "" };

  return (
    <div className="h-full min-h-[520px] w-full bg-white">
      {isSofa && !sofaValidation.valid ? (
        <div className="absolute left-1/2 top-6 z-20 w-[min(520px,calc(100%-40px))] -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm font-medium text-amber-950 shadow-xl shadow-black/8 backdrop-blur">
          {sofaValidation.message}
        </div>
      ) : null}

      <Canvas
        shadows
        camera={{ position: isSofa ? [4.8, 2.5, 5.8] : [4.5, 2.8, 5.5], fov: 33 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.8;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight
          intensity={0.26}
          color="#ffffff"
          groundColor="#e7e7e7"
        />
        <directionalLight
          castShadow
          position={[5.6, 7.4, 3.2]}
          intensity={0.95}
          color="#ffffff"
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
          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.012, 0]}
          >
            <planeGeometry args={[18, 18]} />
            <shadowMaterial transparent opacity={0.14} />
          </mesh>

          <Grid
            position={[0, 0.002, 0]}
            args={[12, 12]}
            cellSize={0.1}
            cellThickness={0.18}
            cellColor="#d8d8d8"
            sectionSize={1}
            sectionThickness={0.42}
            sectionColor="#c6c6c6"
            fadeDistance={7.5}
            fadeStrength={1.8}
            infiniteGrid={false}
            followCamera={false}
          />

          {isSofa ? (
            <SofaAssembly
              product={product}
              selectedModuleIds={selectedModuleIds}
              selectedModuleEntries={selectedModuleEntries}
              selectedVariant={selectedVariant}
              pendingInsertionSlots={pendingSofaInsertionSlots}
              onSelectInsertionSlot={onSelectSofaInsertionSlot}
              collisionCheckModuleIndex={collisionCheckModuleIndex}
              onRemoveCollidingModule={onRemoveCollidingSofaModule}
            />
          ) : (
            <TableAssembly
              selectedTop={selectedTop}
              selectedLegs={selectedLegs}
              topGap={0}
            />
          )}

          <Environment preset="apartment" blur={0.9} />

          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.52}
            scale={9}
            blur={2.1}
            far={4.6}
            resolution={1024}
          />
        </Suspense>

        <OrbitControls
          enablePan
          enableDamping
          panSpeed={0.85}
          minDistance={2.5}
          maxDistance={isSofa ? 11 : 9}
          target={isSofa ? [0, 0.72, 0] : [0, 0.9, 0]}
          mouseButtons={{
            LEFT: panMode ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: panMode ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
          }}
        />
      </Canvas>
    </div>
  );
}
