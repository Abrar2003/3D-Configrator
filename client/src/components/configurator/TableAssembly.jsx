// src/components/configurator/TableAssembly.jsx

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

function toVector(value, fallback = [0, 0, 0]) {
  return Array.isArray(value) && value.length === 3 ? value : fallback;
}

export default function TableAssembly({
  selectedTop,
  selectedLegs,
  topGap = 0.02,
}) {
  const { scene: topSource } = useGLTF(selectedTop.modelUrl);
  const { scene: legsSource } = useGLTF(selectedLegs.modelUrl);

  const assembly = useMemo(() => {
    const top = topSource.clone(true);
    const legs = legsSource.clone(true);

    const topScale = toVector(selectedTop.scale, [1, 1, 1]);
    const legsScale = toVector(selectedLegs.scale, [1, 1, 1]);

    top.scale.set(...topScale);
    legs.scale.set(...legsScale);

    top.updateMatrixWorld(true);
    legs.updateMatrixWorld(true);

    const topBox = new THREE.Box3().setFromObject(top);
    const legsBox = new THREE.Box3().setFromObject(legs);

    const topCenter = new THREE.Vector3();
    const legsCenter = new THREE.Vector3();

    topBox.getCenter(topCenter);
    legsBox.getCenter(legsCenter);

    const topOffset = toVector(selectedTop.offset, [0, 0, 0]);
    const legsOffset = toVector(selectedLegs.offset, [0, 0, 0]);

    // Put legs on floor and center them.
    const legsPosition = [
      -legsCenter.x + legsOffset[0],
      -legsBox.min.y + legsOffset[1],
      -legsCenter.z + legsOffset[2],
    ];

    // Find final top point of legs after moving legs.
    const legsTopY = legsBox.max.y + legsPosition[1];

    // Put tabletop bottom exactly on top of legs.
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
    topSource,
    legsSource,
    selectedTop.scale,
    selectedLegs.scale,
    selectedTop.offset,
    selectedLegs.offset,
    topGap,
  ]);

  return (
    <group>
      <primitive object={assembly.legs} position={assembly.legsPosition} />
      <primitive object={assembly.top} position={assembly.topPosition} />
    </group>
  );
}
