import { Component, useMemo } from "react";
import * as THREE from "three";
import { Html, Line, Text, useGLTF, useTexture } from "@react-three/drei";
import { Trash2 } from "lucide-react";
import {
  calculateSofaDimensions,
  getSofaModuleModelUrl,
  getSelectedSofaModules,
  validateSofaConfiguration,
} from "../../utils/sofaConfig";

const TURN_CONNECTION_TRIM_METERS = 0.001;
const DEFAULT_FABRIC_MATERIAL_NAMES = ["Material__26"];

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

function getModuleConnectionSize(module, measuredRowSize, measuredFrontSize) {
  const connectionWidth = Number(module.connectionWidthCm) / 100;
  const connectionDepth = Number(module.connectionDepthCm) / 100;
  const catalogWidth = Number(module.widthCm) / 100;
  const catalogDepth = Number(module.depthCm) / 100;

  return {
    rowSize:
      Number.isFinite(connectionWidth) && connectionWidth > 0
        ? connectionWidth
        : Number.isFinite(catalogWidth) && catalogWidth > 0
          ? catalogWidth
          : measuredRowSize,
    frontSize:
      Number.isFinite(connectionDepth) && connectionDepth > 0
        ? connectionDepth
        : Number.isFinite(catalogDepth) && catalogDepth > 0
          ? catalogDepth
          : measuredFrontSize,
  };
}

function getModuleDisplaySize(module, connectionSize) {
  const catalogWidth = Number(module.widthCm) / 100;
  const catalogDepth = Number(module.depthCm) / 100;

  return {
    rowSize:
      Number.isFinite(catalogWidth) && catalogWidth > 0
        ? catalogWidth
        : connectionSize.rowSize,
    frontSize:
      Number.isFinite(catalogDepth) && catalogDepth > 0
        ? catalogDepth
        : connectionSize.frontSize,
  };
}

function getFootprintFromCorners(corners) {
  return corners.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point[0]),
      maxX: Math.max(bounds.maxX, point[0]),
      minZ: Math.min(bounds.minZ, point[2]),
      maxZ: Math.max(bounds.maxZ, point[2]),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );
}

function getConnectionFootprint(anchor, rowDirection, frontDirection, rowSize, frontSize, offset) {
  const footprintAnchor = addVectors(anchor, offset);

  return getFootprintFromCorners([
    footprintAnchor,
    addVectors(footprintAnchor, scaleVector(rowDirection, rowSize)),
    addVectors(footprintAnchor, scaleVector(frontDirection, frontSize)),
    addVectors(
      addVectors(footprintAnchor, scaleVector(rowDirection, rowSize)),
      scaleVector(frontDirection, frontSize)
    ),
  ]);
}

function getRenderedFootprintBounds(objects = []) {
  const footprints = objects
    .map((object) => object.displayFootprint ?? object.footprint)
    .filter(Boolean);

  if (!footprints.length) {
    return null;
  }

  return footprints.reduce(
    (bounds, footprint) => ({
      minX: Math.min(bounds.minX, footprint.minX),
      maxX: Math.max(bounds.maxX, footprint.maxX),
      minZ: Math.min(bounds.minZ, footprint.minZ),
      maxZ: Math.max(bounds.maxZ, footprint.maxZ),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );
}

function getModuleRotation(module, moduleEntry) {
  return (
    module.rotationByPlacement?.[moduleEntry?.placementSide] ??
    module.rotation
  );
}

function isFabricMaterial(material, fabricMaterialNames) {
  const materialName = material?.name ?? "";

  return fabricMaterialNames.some((fabricMaterialName) =>
    materialName.includes(fabricMaterialName)
  );
}

function applyFabricTexture(material, texture) {
  const nextMaterial = material.clone();

  nextMaterial.map = texture;
  nextMaterial.bumpMap = texture;
  nextMaterial.bumpScale = 0.012;
  nextMaterial.color?.set("#ffffff");
  nextMaterial.roughness = 0.94;
  nextMaterial.metalness = 0;
  nextMaterial.envMapIntensity = 0.25;
  nextMaterial.needsUpdate = true;

  return nextMaterial;
}

function prepareSofaClone(
  source,
  module,
  moduleEntry,
  segmentAngle = 0,
  fabricTexture,
  fabricMaterialNames = DEFAULT_FABRIC_MATERIAL_NAMES
) {
  const clone = source.clone(true);
  const scale = toVector(module.scale, [1, 1, 1]);
  const rotation = toVector(getModuleRotation(module, moduleEntry), [0, 0, 0]);

  clone.scale.set(...scale);
  clone.rotation.set(rotation[0], rotation[1] + segmentAngle, rotation[2]);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (fabricTexture) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) =>
            isFabricMaterial(material, fabricMaterialNames)
              ? applyFabricTexture(material, fabricTexture)
              : material
          );
        } else if (isFabricMaterial(child.material, fabricMaterialNames)) {
          child.material = applyFabricTexture(child.material, fabricTexture);
        }
      }
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

function SofaDimensionGuide({ dimensions, footprintBounds }) {
  const width = footprintBounds
    ? footprintBounds.maxZ - footprintBounds.minZ
    : dimensions.widthCm / 100;
  const depth = footprintBounds
    ? footprintBounds.maxX - footprintBounds.minX
    : dimensions.depthCm / 100;
  const height = dimensions.heightCm / 100;
  const y = 0.028;
  const lineColor = "#252525";
  const labelGap = 0.16;
  const minX = footprintBounds?.minX ?? 0;
  const maxX = footprintBounds?.maxX ?? depth;
  const minZ = footprintBounds?.minZ ?? 0;
  const maxZ = footprintBounds?.maxZ ?? width;
  const widthX = maxX + labelGap;
  const depthZ = minZ - labelGap;
  const heightX = maxX + labelGap * 1.5;
  const heightZ = maxZ;

  if (!width || !depth || !height) {
    return null;
  }

  return (
    <group>
      <Line
        points={[
          [widthX, y, minZ],
          [widthX, y, maxZ],
        ]}
        color={lineColor}
        lineWidth={1.45}
        transparent
        opacity={0.78}
      />
      <Line
        points={[
          [minX, y, depthZ],
          [maxX, y, depthZ],
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
        position={[widthX + labelGap, y + 0.006, (minZ + maxZ) / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        {formatCm(width * 100)}
      </DimensionLabel>
      <DimensionLabel
        position={[(minX + maxX) / 2, y + 0.006, depthZ - labelGap]}
      >
        {formatCm(depth * 100)}
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

function getModuleActionPosition(moduleObject) {
  if (moduleObject?.footprint) {
    return [
      (moduleObject.footprint.minX + moduleObject.footprint.maxX) / 2,
      0.98,
      (moduleObject.footprint.minZ + moduleObject.footprint.maxZ) / 2,
    ];
  }

  return [
    moduleObject.position[0],
    moduleObject.position[1] + 0.9,
    moduleObject.position[2],
  ];
}

function SofaModuleActions({ moduleObject, canRemove, onRemove }) {
  if (!moduleObject || !canRemove) {
    return null;
  }

  return (
    <Html position={getModuleActionPosition(moduleObject)} center transform={false}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(moduleObject.index);
        }}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl border border-black/10 bg-white text-neutral-950 shadow-2xl shadow-black/18 transition hover:-translate-y-0.5 hover:border-black/20"
        aria-label={`Remove ${moduleObject.module.name}`}
        title={`Remove ${moduleObject.module.name}`}
      >
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-black/10 bg-white" />
        <Trash2 className="relative h-5 w-5" />
      </button>
    </Html>
  );
}

export default function SofaAssembly({
  product,
  selectedModuleIds,
  selectedModuleEntries = [],
  selectedVariant,
  pendingInsertionSlots = [],
  onSelectInsertionSlot,
  selectedModuleIndex,
  onSelectModule,
  onRemoveModule,
  showDimensions = true,
}) {
  const validation = validateSofaConfiguration(product, selectedModuleIds);
  const selectedModules = getSelectedSofaModules(selectedModuleIds, product);
  const selectedVariantOption =
    product?.variants?.find((variant) => variant.id === selectedVariant) ??
    product?.variants?.[0];
  const fabricTexture = useTexture(
    selectedVariantOption?.textureUrl ?? selectedVariantOption?.thumbnailUrl
  );
  const modelUrls = selectedModules.map((module) =>
    getSofaModuleModelUrl(module, selectedVariant)
  );
  const loadedModels = useGLTF(modelUrls);
  const dimensions = calculateSofaDimensions(selectedModuleIds, product);
  const configuredFabricTexture = useMemo(() => {
    const texture = fabricTexture.clone();

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 12;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.repeat.set(1, 1);
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    return texture;
  }, [fabricTexture]);
  const assembly = useMemo(() => {
    const loadedModelList = Array.isArray(loadedModels) ? loadedModels : [loadedModels];
    const fabricMaterialNames =
      product?.fabricMaterialNames ?? DEFAULT_FABRIC_MATERIAL_NAMES;

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
        const fallbackFootprint = getConnectionFootprint(
          currentAnchor,
          currentRowDirection,
          currentFrontDirection,
          fallbackWidth,
          fallbackDepth,
          offset
        );
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
              footprint: fallbackFootprint,
              displayFootprint: fallbackFootprint,
            },
          ],
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

      const clone = prepareSofaClone(
        source,
        module,
        moduleEntry,
        layout.segmentAngle,
        configuredFabricTexture,
        fabricMaterialNames
      );
      const box = new THREE.Box3().setFromObject(clone);
      const points = getBoxCorners(box);
      const rowRange = getProjectionRange(points, currentRowDirection);
      const frontRange = getProjectionRange(points, currentFrontDirection);
      const rowSize = rowRange.max - rowRange.min;
      const frontSize = frontRange.max - frontRange.min;
      const connectionSize = getModuleConnectionSize(
        module,
        rowSize,
        frontSize
      );
      const displaySize = getModuleDisplaySize(module, connectionSize);
      const desiredFront =
        dotVector(currentAnchor, currentFrontDirection) +
        connectionSize.frontSize / 2;
      const desiredRow =
        dotVector(currentAnchor, currentRowDirection) +
        connectionSize.rowSize / 2;
      const currentFrontCenter = (frontRange.min + frontRange.max) / 2;
      const currentRowCenter = (rowRange.min + rowRange.max) / 2;
      const alignmentOffset = addVectors(
        scaleVector(currentFrontDirection, desiredFront - currentFrontCenter),
        scaleVector(currentRowDirection, desiredRow - currentRowCenter)
      );
      const position = [
        alignmentOffset[0] + offset[0],
        -box.min.y + offset[1],
        alignmentOffset[2] + offset[2],
      ];
      const footprint = getConnectionFootprint(
        currentAnchor,
        currentRowDirection,
        currentFrontDirection,
        connectionSize.rowSize,
        connectionSize.frontSize,
        offset
      );
      const displayFootprint = getConnectionFootprint(
        currentAnchor,
        currentRowDirection,
        currentFrontDirection,
        displaySize.rowSize,
        displaySize.frontSize,
        offset
      );
      nextAnchor = addVectors(
        currentAnchor,
        scaleVector(currentRowDirection, connectionSize.rowSize)
      );

      if (module.turnsLayout) {
        nextAnchor = addVectors(
          addVectors(
            currentAnchor,
            scaleVector(
              currentRowDirection,
              connectionSize.rowSize - TURN_CONNECTION_TRIM_METERS
            )
          ),
          scaleVector(
            currentFrontDirection,
            connectionSize.frontSize - TURN_CONNECTION_TRIM_METERS
          )
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
            displayFootprint,
          },
        ],
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
      slotPositions: [[0.54, 0.64, 0]],
      anchor: [0, 0, 0],
      rowDirection: [0, 0, 1],
      frontDirection: [1, 0, 0],
      segmentAngle: 0,
    });
  }, [
    configuredFabricTexture,
    loadedModels,
    product?.fabricMaterialNames,
    selectedModuleEntries,
    selectedModules,
  ]);
  const footprintBounds = useMemo(
    () => getRenderedFootprintBounds(assembly.objects),
    [assembly.objects]
  );
  const selectedModuleObject = useMemo(
    () =>
      Number.isInteger(selectedModuleIndex)
        ? assembly.objects.find((object) => object.index === selectedModuleIndex)
        : null,
    [assembly.objects, selectedModuleIndex]
  );

  if (!validation.valid) {
    return null;
  }

  return (
    <group>
      {showDimensions ? (
        <SofaDimensionGuide
          dimensions={dimensions}
          footprintBounds={footprintBounds}
        />
      ) : null}
      <SofaInsertionMarkers
        slots={pendingInsertionSlots}
        slotPositions={assembly.slotPositions}
        onSelectInsertionSlot={onSelectInsertionSlot}
      />
      <SofaModuleActions
        moduleObject={selectedModuleObject}
        canRemove={selectedModuleIds.length > 1}
        onRemove={onRemoveModule}
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
              onClick={(event) => {
                event.stopPropagation();
                onSelectModule?.(moduleObject.index);
              }}
            >
              <boxGeometry args={moduleObject.size} />
              <meshStandardMaterial
                color="#b8aa8c"
                roughness={0.82}
                metalness={0.02}
              />
            </mesh>
          ) : (
            <primitive
              object={moduleObject.clone}
              position={moduleObject.position}
              onClick={(event) => {
                event.stopPropagation();
                onSelectModule?.(moduleObject.index);
              }}
            />
          )}
        </SofaModuleErrorBoundary>
      ))}
    </group>
  );
}
