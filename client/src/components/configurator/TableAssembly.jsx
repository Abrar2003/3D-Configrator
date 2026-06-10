import { useMemo } from "react";
import * as THREE from "three";
import { Line, Text, useGLTF } from "@react-three/drei";

function toVector(value, fallback = [0, 0, 0]) {
  return Array.isArray(value) && value.length === 3 ? value : fallback;
}

function prepareClone(source, scale) {
  const clone = source.clone(true);

  clone.scale.set(...scale);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  clone.updateMatrixWorld(true);

  return clone;
}

function formatCentimeters(worldUnits) {
  const centimeters = Math.max(1, Math.round((worldUnits * 100) / 5) * 5);
  return `${centimeters}cm`;
}

function DimensionLabel({ children, position, rotation = [-Math.PI / 2, 0, 0] }) {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={0.075}
      color="#4b4b4b"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.0025}
      outlineColor="#ffffff"
    >
      {children}
    </Text>
  );
}

function DimensionGuide({ width, depth }) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const y = 0.026;
  const labelGap = 0.16;
  const tick = 0.12;
  const lineColor = "#252525";

  return (
    <group>
      <Line
        points={[
          [-halfWidth, y, -halfDepth],
          [halfWidth, y, -halfDepth],
          [halfWidth, y, halfDepth],
          [-halfWidth, y, halfDepth],
          [-halfWidth, y, -halfDepth],
        ]}
        color={lineColor}
        lineWidth={1.45}
        transparent
        opacity={0.78}
      />
      <Line
        points={[[-halfWidth, y, halfDepth], [-halfWidth, y, halfDepth + tick]]}
        color={lineColor}
        lineWidth={1}
        transparent
        opacity={0.56}
      />
      <Line
        points={[[halfWidth, y, halfDepth], [halfWidth, y, halfDepth + tick]]}
        color={lineColor}
        lineWidth={1}
        transparent
        opacity={0.56}
      />
      <Line
        points={[[-halfWidth, y, -halfDepth], [-halfWidth - tick, y, -halfDepth]]}
        color={lineColor}
        lineWidth={1}
        transparent
        opacity={0.56}
      />
      <Line
        points={[[-halfWidth, y, halfDepth], [-halfWidth - tick, y, halfDepth]]}
        color={lineColor}
        lineWidth={1}
        transparent
        opacity={0.56}
      />
      <DimensionLabel position={[0, y + 0.006, halfDepth + labelGap]}>
        {formatCentimeters(width)}
      </DimensionLabel>
      <DimensionLabel
        position={[-halfWidth - labelGap, y + 0.006, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        {formatCentimeters(depth)}
      </DimensionLabel>
    </group>
  );
}

function TableAssemblyContent({
  selectedTop,
  selectedLegs,
  topGap,
  showDimensions,
}) {
  const { scene: topSource } = useGLTF(selectedTop.modelUrl);
  const { scene: legsSource } = useGLTF(selectedLegs.modelUrl);

  const assembly = useMemo(() => {
    const topScale = toVector(selectedTop.scale, [1, 1, 1]);
    const legsScale = toVector(selectedLegs.scale, [1, 1, 1]);
    const topOffset = toVector(selectedTop.offset, [0, 0, 0]);
    const legsOffset = toVector(selectedLegs.offset, [0, 0, 0]);

    const top = prepareClone(topSource, topScale);
    const legs = prepareClone(legsSource, legsScale);

    const topBox = new THREE.Box3().setFromObject(top);
    const legsBox = new THREE.Box3().setFromObject(legs);
    const topCenter = topBox.getCenter(new THREE.Vector3());
    const legsCenter = legsBox.getCenter(new THREE.Vector3());

    const legsPosition = [
      -legsCenter.x + legsOffset[0],
      -legsBox.min.y + legsOffset[1],
      -legsCenter.z + legsOffset[2],
    ];

    const legsTopY = legsBox.max.y + legsPosition[1];

    const topPosition = [
      -topCenter.x + legsOffset[0] + topOffset[0],
      legsTopY + topGap - topBox.min.y + topOffset[1],
      -topCenter.z + legsOffset[2] + topOffset[2],
    ];

    const topSize = topBox.getSize(new THREE.Vector3());
    const guideWidth = Math.max(topSize.x + 0.18, 1.1);
    const guideDepth = Math.max(topSize.z + 0.18, 1.1);

    return {
      top,
      legs,
      topPosition,
      legsPosition,
      guideDepth,
      guideWidth,
    };
  }, [
    topGap,
    topSource,
    legsSource,
    selectedTop.offset,
    selectedTop.scale,
    selectedLegs.offset,
    selectedLegs.scale,
  ]);

  return (
    <group>
      {showDimensions ? (
        <DimensionGuide width={assembly.guideWidth} depth={assembly.guideDepth} />
      ) : null}
      <primitive object={assembly.legs} position={assembly.legsPosition} />
      <primitive object={assembly.top} position={assembly.topPosition} />
    </group>
  );
}

export default function TableAssembly({
  selectedTop,
  selectedLegs,
  topGap = -0.02,
  showDimensions = true,
}) {
  if (!selectedTop?.modelUrl || !selectedLegs?.modelUrl) {
    return null;
  }

  return (
    <TableAssemblyContent
      selectedTop={selectedTop}
      selectedLegs={selectedLegs}
      topGap={topGap}
      showDimensions={showDimensions}
    />
  );
}
