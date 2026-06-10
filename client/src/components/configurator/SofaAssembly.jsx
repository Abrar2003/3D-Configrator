import { Component, useEffect, useMemo } from "react";
import * as THREE from "three";
import { Html, Line, Text, useGLTF } from "@react-three/drei";
import {
  calculateSofaDimensions,
  getSofaModuleModelUrl,
  getSelectedSofaModules,
  validateSofaConfiguration,
} from "../../utils/sofaConfig";

const COLLISION_TOLERANCE_METERS = 0.03;

function toVector(value, fallback = [0, 0, 0]) {
  return Array.isArray(value) && value.length === 3 ? value : fallback;
}

function addVectors(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scaleVector(vector, scalar) {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function dotVector(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function getBoxCorners(box) {
  return [
    [box.min.x, box.min.y, box.min.z],
    [box.min.x, box.min.y, box.max.z],
    [box.min.x, box.max.y, box.min.z],
    [box.min.x, box.max.y, box.max.z],
    [box.max.x, box.min.y, box.min.z],
    [box.max.x, box.min.y, box.max.z],
    [box.max.x, box.max.y, box.min.z],
    [box.max.x, box.max.y, box.max.z],
  ];
}

function getProjectionRange(points, axis) {
  return points.reduce(
    (range, point) => {
      const value = dotVector(point, axis);

      return {
        min: Math.min(range.min, value),
        max: Math.max(range.max, value),
      };
    },
    { min: Infinity, max: -Infinity }
  );
}

function getBoxFootprint(box, position = [0, 0, 0]) {
  return {
    minX: box.min.x + position[0],
    maxX: box.max.x + position[0],
    minZ: box.min.z + position[2],
    maxZ: box.max.z + position[2],
  };
}

function getCenteredFootprint(position, size) {
  const [depth, , width] = size;

  return {
    minX: position[0] - depth / 2,
    maxX: position[0] + depth / 2,
    minZ: position[2] - width / 2,
    maxZ: position[2] + width / 2,
  };
}

function footprintsCollide(first, second) {
  const xOverlap =
    Math.min(first.maxX, second.maxX) - Math.max(first.minX, second.minX);
  const zOverlap =
    Math.min(first.maxZ, second.maxZ) - Math.max(first.minZ, second.minZ);

  return (
    xOverlap > COLLISION_TOLERANCE_METERS &&
    zOverlap > COLLISION_TOLERANCE_METERS
  );
}

function findCollidingRenderedModuleIndex(objects, moduleIndex) {
  if (!Number.isInteger(moduleIndex)) {
    return -1;
  }

  const testedObject = objects.find((object) => object.index === moduleIndex);

  if (!testedObject?.footprint) {
    return -1;
  }

  const collidingObject = objects.find(
    (object) =>
      object.index !== moduleIndex &&
      object.footprint &&
      footprintsCollide(testedObject.footprint, object.footprint)
  );

  return collidingObject ? moduleIndex : -1;
}

function getModuleRotation(module, moduleEntry) {
  return (
    module.rotationByPlacement?.[moduleEntry?.placementSide] ??
    module.rotation
  );
}

function prepareSofaClone(source, module, moduleEntry, segmentAngle = 0) {
  const clone = source.clone(true);
  const scale = toVector(module.scale, [1, 1, 1]);
  const rotation = toVector(getModuleRotation(module, moduleEntry), [0, 0, 0]);

  clone.scale.set(...scale);
  clone.rotation.set(rotation[0], rotation[1] + segmentAngle, rotation[2]);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  clone.updateMatrixWorld(true);

  return clone;
}

function formatCm(value) {
  return `${Math.round(value)}cm`;
}

function DimensionLabel({
  children,
  position,
  rotation = [-Math.PI / 2, 0, 0],
}) {
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

function SofaDimensionGuide({ dimensions, renderedWidthMeters }) {
  const width = renderedWidthMeters || dimensions.widthCm / 100;
  const depth = dimensions.depthCm / 100;
  const height = dimensions.heightCm / 100;
  const y = 0.028;
  const lineColor = "#252525";
  const labelGap = 0.16;
  const connectorPlaneX = 0;
  const frontX = depth;
  const widthX = connectorPlaneX + 0.2;
  const depthZ = -0.2;
  const heightX = connectorPlaneX + 0.28;
  const heightZ = width;

  if (!width || !depth || !height) {
    return null;
  }

  return (
    <group>
      <Line
        points={[
          [widthX, y, 0],
          [widthX, y, width],
        ]}
        color={lineColor}
        lineWidth={1.45}
        transparent
        opacity={0.78}
      />
      <Line
        points={[
          [frontX, y, depthZ],
          [connectorPlaneX, y, depthZ],
        ]}
        color={lineColor}
        lineWidth={1.45}
        transparent
        opacity={0.78}
      />
      <Line
        points={[
          [heightX, y, heightZ],
          [heightX, height, heightZ],
        ]}
        color={lineColor}
        lineWidth={1.45}
        transparent
        opacity={0.78}
      />

      <DimensionLabel
        position={[widthX + labelGap, y + 0.006, width / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        {formatCm(dimensions.widthCm)}
      </DimensionLabel>
      <DimensionLabel
        position={[frontX / 2, y + 0.006, depthZ - labelGap]}
      >
        {formatCm(dimensions.depthCm)}
      </DimensionLabel>
      <DimensionLabel
        position={[heightX + 0.08, height / 2, heightZ]}
        rotation={[0, 0, 0]}
      >
        {formatCm(dimensions.heightCm)}
      </DimensionLabel>
    </group>
  );
}

class SofaModuleErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function SofaModuleFallback({ modulePosition }) {
  const width = modulePosition.module.widthCm / 100;
  const depth = modulePosition.module.depthCm / 100;
  const height = modulePosition.module.heightCm / 100;
  const rotation = modulePosition.rotation ?? [0, 0, 0];

  return (
    <mesh
      castShadow
      receiveShadow
      position={modulePosition.position}
      rotation={rotation}
    >
      <boxGeometry args={[depth, height, width]} />
      <meshStandardMaterial
        color="#b8aa8c"
        roughness={0.82}
        metalness={0.02}
      />
    </mesh>
  );
}

function SofaInsertionMarkers({
  slots,
  slotPositions,
  onSelectInsertionSlot,
}) {
  if (!slots.length || !onSelectInsertionSlot) {
    return null;
  }

  return (
    <group>
      {slots.map((slot) => {
        const position = slotPositions[slot.index];
        if (!position) return null;

        return (
          <Html
            key={`${slot.index}-${slot.side}`}
            position={position}
            center
            transform={false}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectInsertionSlot(slot.index);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#e4ad3f] text-lg font-bold text-white shadow-xl shadow-black/20 transition hover:scale-105 hover:bg-[#cf982f]"
              aria-label={slot.label || "Place sofa element here"}
              title={slot.label || "Place here"}
            >
              ↔
            </button>
          </Html>
        );
      })}
    </group>
  );
}

export default function SofaAssembly({
  product,
  selectedModuleIds,
  selectedModuleEntries = [],
  selectedVariant,
  pendingInsertionSlots = [],
  onSelectInsertionSlot,
  collisionCheckModuleIndex,
  onRemoveCollidingModule,
}) {
  const validation = validateSofaConfiguration(product, selectedModuleIds);
  const selectedModules = getSelectedSofaModules(selectedModuleIds, product);
  const modelUrls = selectedModules.map((module) =>
    getSofaModuleModelUrl(module, selectedVariant)
  );
  const loadedModels = useGLTF(modelUrls);
  const dimensions = calculateSofaDimensions(selectedModuleIds, product);
  const assembly = useMemo(() => {
    const loadedModelList = Array.isArray(loadedModels) ? loadedModels : [loadedModels];
    return selectedModules.reduce((layout, module, index) => {
      const source = loadedModelList[index]?.scene;
      const moduleEntry = selectedModuleEntries[index];
      const offset = toVector(module.offset, [0, 0, 0]);
      const turnDirection = moduleEntry?.placementSide === "left" ? -1 : 1;
      const currentAnchor = layout.anchor;
      const currentRowDirection = layout.rowDirection;
      const currentFrontDirection = layout.frontDirection;
      let nextAnchor;
      let nextRowDirection = currentRowDirection;
      let nextFrontDirection = currentFrontDirection;
      let nextSegmentAngle = layout.segmentAngle;

      if (!source) {
        const fallbackWidth = module.widthCm / 100;
        const fallbackDepth = module.depthCm / 100;
        const fallbackHeight = module.heightCm / 100;
        const fallbackCenter = addVectors(
          addVectors(
            currentAnchor,
            scaleVector(currentFrontDirection, fallbackDepth / 2)
          ),
          scaleVector(currentRowDirection, fallbackWidth / 2)
        );
        const fallbackPosition = [
          fallbackCenter[0] + offset[0],
          fallbackHeight / 2 + offset[1],
          fallbackCenter[2] + offset[2],
        ];
        const fallbackSize = [fallbackDepth, fallbackHeight, fallbackWidth];
        nextAnchor = addVectors(
          currentAnchor,
          scaleVector(currentRowDirection, fallbackWidth)
        );

        if (module.turnsLayout) {
          nextAnchor = addVectors(
            addVectors(
              currentAnchor,
              scaleVector(currentRowDirection, fallbackWidth)
            ),
            scaleVector(currentFrontDirection, fallbackDepth)
          );
          nextRowDirection = scaleVector(currentFrontDirection, turnDirection);
          nextFrontDirection = scaleVector(currentRowDirection, -turnDirection);
          nextSegmentAngle = layout.segmentAngle + turnDirection * Math.PI / 2;
        }

        return {
          objects: [
            ...layout.objects,
            {
              fallback: true,
              module,
              index,
              position: fallbackPosition,
              size: fallbackSize,
              rotation: [0, layout.segmentAngle, 0],
              footprint: getCenteredFootprint(fallbackPosition, fallbackSize),
            },
          ],
          renderedWidthMeters: layout.renderedWidthMeters + fallbackWidth,
          slotPositions: [
            ...layout.slotPositions,
            addVectors(nextAnchor, scaleVector(nextFrontDirection, 0.54)).map(
              (value, axisIndex) => axisIndex === 1 ? 0.64 : value
            ),
          ],
          anchor: nextAnchor,
          rowDirection: nextRowDirection,
          frontDirection: nextFrontDirection,
          segmentAngle: nextSegmentAngle,
        };
      }

      const clone = prepareSofaClone(source, module, moduleEntry, layout.segmentAngle);
      const box = new THREE.Box3().setFromObject(clone);
      const points = getBoxCorners(box);
      const rowRange = getProjectionRange(points, currentRowDirection);
      const frontRange = getProjectionRange(points, currentFrontDirection);
      const rowSize = rowRange.max - rowRange.min;
      const frontSize = frontRange.max - frontRange.min;
      const desiredFront = dotVector(currentAnchor, currentFrontDirection);
      const desiredRow = dotVector(currentAnchor, currentRowDirection);
      const alignmentOffset = addVectors(
        scaleVector(currentFrontDirection, desiredFront - frontRange.min),
        scaleVector(currentRowDirection, desiredRow - rowRange.min)
      );
      const position = [
        alignmentOffset[0] + offset[0],
        -box.min.y + offset[1],
        alignmentOffset[2] + offset[2],
      ];
      const footprint = getBoxFootprint(box, position);
      nextAnchor = addVectors(currentAnchor, scaleVector(currentRowDirection, rowSize));

      if (module.turnsLayout) {
        nextAnchor = addVectors(
          addVectors(currentAnchor, scaleVector(currentRowDirection, rowSize)),
          scaleVector(currentFrontDirection, frontSize)
        );
        nextRowDirection = scaleVector(currentFrontDirection, turnDirection);
        nextFrontDirection = scaleVector(currentRowDirection, -turnDirection);
        nextSegmentAngle = layout.segmentAngle + turnDirection * Math.PI / 2;
      }

      return {
        objects: [
          ...layout.objects,
          {
            clone,
            module,
            index,
            position,
            footprint,
          },
        ],
        renderedWidthMeters: layout.renderedWidthMeters + rowSize,
        slotPositions: [
          ...layout.slotPositions,
          addVectors(nextAnchor, scaleVector(nextFrontDirection, 0.54)).map(
            (value, axisIndex) => axisIndex === 1 ? 0.64 : value
          ),
        ],
        anchor: nextAnchor,
        rowDirection: nextRowDirection,
        frontDirection: nextFrontDirection,
        segmentAngle: nextSegmentAngle,
      };
    }, {
      objects: [],
      renderedWidthMeters: 0,
      slotPositions: [[0.54, 0.64, 0]],
      anchor: [0, 0, 0],
      rowDirection: [0, 0, 1],
      frontDirection: [1, 0, 0],
      segmentAngle: 0,
    });
  }, [loadedModels, selectedModuleEntries, selectedModules]);
  const collidingRenderedModuleIndex = useMemo(
    () =>
      findCollidingRenderedModuleIndex(
        assembly.objects,
        collisionCheckModuleIndex
      ),
    [assembly.objects, collisionCheckModuleIndex]
  );

  useEffect(() => {
    if (collidingRenderedModuleIndex >= 0) {
      onRemoveCollidingModule?.(collidingRenderedModuleIndex);
    }
  }, [collidingRenderedModuleIndex, onRemoveCollidingModule]);

  if (!validation.valid) {
    return null;
  }

  return (
    <group>
      <SofaDimensionGuide
        dimensions={dimensions}
        renderedWidthMeters={assembly.renderedWidthMeters}
      />
      <SofaInsertionMarkers
        slots={pendingInsertionSlots}
        slotPositions={assembly.slotPositions}
        onSelectInsertionSlot={onSelectInsertionSlot}
      />
      {assembly.objects.map((moduleObject) => (
        <SofaModuleErrorBoundary
          key={`${moduleObject.module.id}-${moduleObject.index}`}
          fallback={
            <SofaModuleFallback
              modulePosition={{
                module: moduleObject.module,
                position: moduleObject.position,
                rotation: moduleObject.rotation,
              }}
            />
          }
        >
          {moduleObject.fallback ? (
            <mesh
              castShadow
              receiveShadow
              position={moduleObject.position}
            >
              <boxGeometry args={moduleObject.size} />
              <meshStandardMaterial
                color="#b8aa8c"
                roughness={0.82}
                metalness={0.02}
              />
            </mesh>
          ) : (
            <primitive object={moduleObject.clone} position={moduleObject.position} />
          )}
        </SofaModuleErrorBoundary>
      ))}
    </group>
  );
}
