import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

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

function TableAssemblyContent({ selectedTop, selectedLegs, topGap }) {
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

    return {
      top,
      legs,
      topPosition,
      legsPosition,
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
      <primitive object={assembly.legs} position={assembly.legsPosition} />
      <primitive object={assembly.top} position={assembly.topPosition} />
    </group>
  );
}

export default function TableAssembly({
  selectedTop,
  selectedLegs,
  topGap = -0.02,
}) {
  if (!selectedTop?.modelUrl || !selectedLegs?.modelUrl) {
    return null;
  }

  return (
    <TableAssemblyContent
      selectedTop={selectedTop}
      selectedLegs={selectedLegs}
      topGap={topGap}
    />
  );
}
