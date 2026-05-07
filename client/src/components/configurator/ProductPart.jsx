// src/components/configurator/ProductPart.jsx

import { Clone, useGLTF } from "@react-three/drei";

export default function ProductPart({
  modelUrl,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
}) {
  const { scene } = useGLTF(modelUrl);

  return (
    <Clone
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}