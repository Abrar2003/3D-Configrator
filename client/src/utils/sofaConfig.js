function toSafeNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

const COLLISION_TOLERANCE_METERS = 0.03;

function toVector3(value, fallback = [0, 0, 0]) {
  return Array.isArray(value) && value.length === 3 ? value : fallback;
}

function addPlanVector(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function scalePlanVector(vector, scalar) {
  return [vector[0] * scalar, vector[1] * scalar];
}

function getPlanBounds(points) {
  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point[0]),
      maxX: Math.max(bounds.maxX, point[0]),
      minZ: Math.min(bounds.minZ, point[1]),
      maxZ: Math.max(bounds.maxZ, point[1]),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );
}

function getFootprintOverlap(first, second) {
  return {
    x: Math.min(first.maxX, second.maxX) - Math.max(first.minX, second.minX),
    z: Math.min(first.maxZ, second.maxZ) - Math.max(first.minZ, second.minZ),
  };
}

function footprintsCollide(first, second) {
  const overlap = getFootprintOverlap(first, second);

  return (
    overlap.x > COLLISION_TOLERANCE_METERS &&
    overlap.z > COLLISION_TOLERANCE_METERS
  );
}

function entryToModuleId(entry) {
  return typeof entry === "string" ? entry : entry?.id;
}

export function getSofaModuleById(product, moduleId) {
  return product?.modules?.find((module) => module.id === moduleId) ?? null;
}

export function getSelectedSofaModules(selectedModuleIds = [], product) {
  return selectedModuleIds
    .map((moduleId) => getSofaModuleById(product, entryToModuleId(moduleId)))
    .filter(Boolean);
}

export function getSofaModuleModelUrl(module, selectedVariant) {
  return module?.variantModels?.[selectedVariant]?.modelUrl ?? null;
}

function connectorCanJoin(leftConnector, rightConnector) {
  return leftConnector === "open" && rightConnector === "open";
}

export function canConnectSofaModules(leftModule, rightModule) {
  return connectorCanJoin(
    leftModule?.connectors?.right,
    rightModule?.connectors?.left
  );
}

function getRuleDisabledSofaOptions(selectedModuleIds = [], product) {
  const selectedModules = getSelectedSofaModules(selectedModuleIds, product);
  const disabledIds = new Set();
  const selectedCounts = selectedModuleIds.reduce((counts, moduleId) => {
    counts.set(moduleId, (counts.get(moduleId) ?? 0) + 1);
    return counts;
  }, new Map());

  selectedModules.forEach((selectedModule) => {
    if (!selectedModule.repeatable) {
      disabledIds.add(selectedModule.id);
    }

    selectedModule.blocksAfterSelect?.forEach((blockedTarget) => {
      const matchingGroup = product.moduleGroups?.some(
        (group) => group.id === blockedTarget
      );

      if (matchingGroup) {
        product.modules
          .filter((module) => module.groupId === blockedTarget)
          .forEach((module) => {
            disabledIds.add(module.id);
          });
      } else {
        disabledIds.add(blockedTarget);
      }
    });
  });

  product.rules?.maxOneFromGroups?.forEach((groupId) => {
    const hasSelectionFromGroup = selectedModules.some(
      (module) => module.groupId === groupId
    );

    if (hasSelectionFromGroup) {
      product.modules
        .filter((module) => module.groupId === groupId)
        .forEach((module) => {
          disabledIds.add(module.id);
        });
    }
  });

  product.rules?.incompatibleModules?.forEach((pair) => {
    const selectedInPair = pair.filter((moduleId) => selectedCounts.has(moduleId));

    if (selectedInPair.length > 0) {
      pair
        .filter((moduleId) => !selectedCounts.has(moduleId))
        .forEach((moduleId) => {
          disabledIds.add(moduleId);
        });
    }
  });

  return disabledIds;
}

export function getValidSofaConnectionSides(moduleId, selectedModuleIds = [], product) {
  return getValidSofaInsertionSlots(moduleId, selectedModuleIds, product).map(
    (slot) => slot.side
  );
}

export function getValidSofaInsertionSlots(moduleId, selectedModuleIds = [], product) {
  const nextModule = getSofaModuleById(product, moduleId);
  const selectedModules = getSelectedSofaModules(selectedModuleIds, product);

  if (!nextModule) {
    return [];
  }

  if (selectedModules.length === 0) {
    return [{ index: 0, side: "right", label: "Place here" }];
  }

  const slots = [];

  if (canConnectSofaModules(nextModule, selectedModules[0])) {
    slots.push({ index: 0, side: "left", label: "Place left" });
  }

  for (let index = 1; index < selectedModules.length; index += 1) {
    const leftModule = selectedModules[index - 1];
    const rightModule = selectedModules[index];

    if (
      canConnectSofaModules(leftModule, nextModule) &&
      canConnectSofaModules(nextModule, rightModule)
    ) {
      slots.push({ index, side: "between", label: "Place here" });
    }
  }

  if (canConnectSofaModules(selectedModules[selectedModules.length - 1], nextModule)) {
    slots.push({
      index: selectedModules.length,
      side: "right",
      label: "Place right",
    });
  }

  return slots;
}

export function getDisabledSofaOptions(selectedModuleIds = [], product) {
  const disabledIds = getRuleDisabledSofaOptions(selectedModuleIds, product);

  product?.modules?.forEach((module) => {
    const isRuleDisabled = disabledIds.has(module.id);

    if (
      !isRuleDisabled &&
      getValidSofaConnectionSides(module.id, selectedModuleIds, product).length === 0
    ) {
      disabledIds.add(module.id);
    }
  });

  return disabledIds;
}

export function validateSofaConfiguration(product, selectedModuleIds = []) {
  const modules = getSelectedSofaModules(selectedModuleIds, product);

  if (modules.length === 0) {
    return {
      valid: false,
      message: "Choose at least one sofa element to build your sofa.",
    };
  }

  const firstInvalidIndex = modules.findIndex((module, index) => {
    if (index === 0) {
      return false;
    }

    const previousModule = modules[index - 1];
    return !connectorCanJoin(previousModule.connectors?.right, module.connectors?.left);
  });

  if (firstInvalidIndex >= 0) {
    return {
      valid: false,
      message:
        "These elements do not connect in this order. Place left-arm pieces first, open middle pieces between them, and right-arm pieces last.",
    };
  }

  const leftArmAfterOpenModule = modules.some(
    (module, index) => module.groupId === "left_connectable" && index > 0
  );

  if (leftArmAfterOpenModule) {
    return {
      valid: false,
      message: "Left-arm elements need to start the sofa layout.",
    };
  }

  const rightArmBeforeEnd = modules.some(
    (module, index) =>
      module.groupId === "right_connectable" && index < modules.length - 1
  );

  if (rightArmBeforeEnd) {
    return {
      valid: false,
      message: "Right-arm elements need to finish the sofa layout.",
    };
  }

  return { valid: true, message: "" };
}

export function calculateSofaDimensions(selectedModuleIds = [], product) {
  const modules = getSelectedSofaModules(selectedModuleIds, product);

  return modules.reduce(
    (dimensions, module) => ({
      widthCm: dimensions.widthCm + toSafeNumber(module.widthCm),
      depthCm: Math.max(dimensions.depthCm, toSafeNumber(module.depthCm)),
      heightCm: Math.max(dimensions.heightCm, toSafeNumber(module.heightCm)),
    }),
    { widthCm: 0, depthCm: 0, heightCm: 0 }
  );
}

export function calculateSofaPrice(
  selectedModuleIds = [],
  selectedVariant,
  product
) {
  const basePrice = toSafeNumber(product?.basePrice);
  const selectedVariantOption = product?.variants?.find(
    (variant) => variant.id === selectedVariant
  );
  const modulesPrice = getSelectedSofaModules(selectedModuleIds, product).reduce(
    (total, module) => total + toSafeNumber(module.price),
    0
  );

  return basePrice + modulesPrice + toSafeNumber(selectedVariantOption?.price);
}

export function getSofaModuleFootprints(selectedModuleEntries = [], product) {
  let anchor = [0, 0];
  let rowDirection = [0, 1];
  let frontDirection = [1, 0];

  return selectedModuleEntries
    .map((entry, index) => {
      const module = getSofaModuleById(product, entryToModuleId(entry));

      if (!module) {
        return null;
      }

      const offset = toVector3(module.offset);
      const planOffset = [toSafeNumber(offset[0]), toSafeNumber(offset[2])];
      const width = toSafeNumber(module.widthCm) / 100;
      const depth = toSafeNumber(module.depthCm) / 100;
      const baseAnchor = addPlanVector(anchor, planOffset);
      const rowEdge = scalePlanVector(rowDirection, width);
      const frontEdge = scalePlanVector(frontDirection, depth);
      const corners = [
        baseAnchor,
        addPlanVector(baseAnchor, rowEdge),
        addPlanVector(baseAnchor, frontEdge),
        addPlanVector(addPlanVector(baseAnchor, rowEdge), frontEdge),
      ];
      const footprint = {
        module,
        index,
        ...getPlanBounds(corners),
      };
      let nextAnchor = addPlanVector(anchor, rowEdge);

      if (module.turnsLayout) {
        const turnDirection = entry?.placementSide === "left" ? -1 : 1;

        nextAnchor = addPlanVector(addPlanVector(anchor, rowEdge), frontEdge);
        [rowDirection, frontDirection] = [
          scalePlanVector(frontDirection, turnDirection),
          scalePlanVector(rowDirection, -turnDirection),
        ];
      }

      anchor = nextAnchor;

      return footprint;
    })
    .filter(Boolean);
}

export function findCollidingSofaModuleIndex(
  selectedModuleEntries = [],
  moduleIndex,
  product
) {
  const footprints = getSofaModuleFootprints(selectedModuleEntries, product);
  const testedFootprint = footprints.find(
    (footprint) => footprint.index === moduleIndex
  );

  if (!testedFootprint) {
    return -1;
  }

  const collidingFootprint = footprints.find(
    (footprint) =>
      footprint.index !== moduleIndex && footprintsCollide(testedFootprint, footprint)
  );

  return collidingFootprint?.index ?? -1;
}

export function getSofaModulePositions(selectedModuleIds = [], product) {
  let currentX = 0;

  return getSelectedSofaModules(selectedModuleIds, product).map((module, index) => {
    const offset = Array.isArray(module.offset) && module.offset.length === 3
      ? module.offset
      : [0, 0, 0];
    const position = {
      module,
      index,
      x: currentX + toSafeNumber(offset[0]),
      y: toSafeNumber(offset[1]),
      z: toSafeNumber(offset[2]),
    };

    currentX += toSafeNumber(module.widthCm) / 100;

    return position;
  });
}
