import { useMemo, useState } from "react";
import { sofaProduct } from "../../data/sofaProduct";
import { tableProduct } from "../../data/tableProduct";
import { calculateTablePrice } from "../../utils/priceCalculator";
import {
  calculateSofaDimensions,
  calculateSofaPrice,
  findCollidingSofaModuleIndex,
  getDisabledSofaOptions,
  getSofaModuleById,
  getValidSofaInsertionSlots,
} from "../../utils/sofaConfig";
import ConfigSidebar from "./ConfigSidebar";
import FloatingViewerToolbar from "./FloatingViewerToolbar";
import PricePill from "./PricePill";
import ProductScene from "./ProductScene";

function createSofaModuleEntry(moduleId, placementSide = "right") {
  return { id: moduleId, placementSide };
}

function resolvePlacementSide(slot, module) {
  if (module?.turnsLayout && slot?.side === "left") {
    return "right";
  }

  if (slot?.side === "left" || slot?.side === "right") {
    return slot.side;
  }

  return "right";
}

function resolveDefaultSofaInsertionSlot(validSlots, selectedModuleIds, product) {
  if (validSlots.length === 1) {
    return validSlots[0];
  }

  const lastSelectedModule = getSofaModuleById(
    product,
    selectedModuleIds[selectedModuleIds.length - 1]
  );
  const rightEndSlot = validSlots.find(
    (slot) => slot.side === "right" && slot.index === selectedModuleIds.length
  );

  if (lastSelectedModule?.turnsLayout && rightEndSlot) {
    return rightEndSlot;
  }

  return null;
}

export default function Configurator({ productType = "sofa" }) {
  const product = productType === "table" ? tableProduct : sofaProduct;
  const isSofa = product.productType === "sofa";
  const defaultTableTypeId =
    tableProduct.defaultConfig.tableType ?? tableProduct.tableTypes[0]?.id ?? "";
  const defaultTopId =
    tableProduct.defaultConfig.top ?? tableProduct.tops[0]?.id ?? "";
  const defaultLegsId =
    tableProduct.defaultConfig.legs ?? tableProduct.legs[0]?.id ?? "";
  const defaultSofaModuleIds =
    sofaProduct.defaultConfig.modules?.length > 0
      ? sofaProduct.defaultConfig.modules
      : [sofaProduct.modules[0]?.id].filter(Boolean);
  const defaultSofaVariant =
    sofaProduct.defaultConfig.variant ?? sofaProduct.variants[0]?.id ?? "";

  const [selectedTableTypeId, setSelectedTableTypeId] = useState(defaultTableTypeId);
  const [selectedTopId, setSelectedTopId] = useState(defaultTopId);
  const [selectedLegsId, setSelectedLegsId] = useState(defaultLegsId);
  const [selectedModuleEntries, setSelectedModuleEntries] = useState(() =>
    defaultSofaModuleIds.map((moduleId) => createSofaModuleEntry(moduleId))
  );
  const [selectedVariant, setSelectedVariant] = useState(defaultSofaVariant);
  const [pendingSofaModuleId, setPendingSofaModuleId] = useState("");
  const [panMode, setPanMode] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [selectedSofaModuleIndex, setSelectedSofaModuleIndex] = useState(null);

  const selectedModuleIds = useMemo(
    () => selectedModuleEntries.map((entry) => entry.id),
    [selectedModuleEntries]
  );

  const selectedTop = useMemo(
    () =>
      tableProduct.tops.find((top) => top.id === selectedTopId) ??
      tableProduct.tops[0],
    [selectedTopId]
  );

  const selectedLegs = useMemo(
    () =>
      tableProduct.legs.find((legsOption) => legsOption.id === selectedLegsId) ??
      tableProduct.legs[0],
    [selectedLegsId]
  );

  const selectedVariantOption = useMemo(
    () =>
      sofaProduct.variants.find((variant) => variant.id === selectedVariant) ??
      sofaProduct.variants[0],
    [selectedVariant]
  );

  const disabledSofaOptionIds = useMemo(
    () => getDisabledSofaOptions(selectedModuleIds, sofaProduct),
    [selectedModuleIds]
  );

  const pendingSofaInsertionSlots = useMemo(
    () =>
      pendingSofaModuleId
        ? getValidSofaInsertionSlots(
            pendingSofaModuleId,
            selectedModuleIds,
            sofaProduct
          )
        : [],
    [pendingSofaModuleId, selectedModuleIds]
  );

  const sofaDimensions = useMemo(
    () => calculateSofaDimensions(selectedModuleIds, sofaProduct),
    [selectedModuleIds]
  );

  const totalPrice = useMemo(
    () =>
      isSofa
        ? calculateSofaPrice(selectedModuleIds, selectedVariant, sofaProduct)
        : calculateTablePrice(tableProduct, selectedTop, selectedLegs),
    [isSofa, selectedLegs, selectedModuleIds, selectedTop, selectedVariant]
  );

  const handleSelectTopMaterial = (material) => {
    const nextTop =
      product.tops.find(
        (top) => top.material === material && top.shape === selectedTop?.shape
      ) ?? product.tops.find((top) => top.material === material);

    if (nextTop) {
      setSelectedTopId(nextTop.id);
    }
  };

  const handleSelectLegsMaterial = (material) => {
    const nextLegs =
      product.legs.find(
        (legsOption) =>
          legsOption.material === material &&
          legsOption.shape === selectedLegs?.shape
      ) ?? product.legs.find((legsOption) => legsOption.material === material);

    if (nextLegs) {
      setSelectedLegsId(nextLegs.id);
    }
  };

  const handleReset = () => {
    setSelectedTableTypeId(defaultTableTypeId);
    setSelectedTopId(defaultTopId);
    setSelectedLegsId(defaultLegsId);
    setSelectedModuleEntries(
      defaultSofaModuleIds.map((moduleId) => createSofaModuleEntry(moduleId))
    );
    setSelectedVariant(defaultSofaVariant);
    setPendingSofaModuleId("");
    setSelectedSofaModuleIndex(null);
  };

  const handleAddSofaModuleAtIndex = (moduleId, insertIndex) => {
    if (disabledSofaOptionIds.has(moduleId)) {
      return;
    }

    const nextModule = getSofaModuleById(sofaProduct, moduleId);

    if (!nextModule) {
      return;
    }

    const validSlots = getValidSofaInsertionSlots(
      moduleId,
      selectedModuleIds,
      sofaProduct
    );
    const selectedSlot = Number.isInteger(insertIndex)
      ? validSlots.find((slot) => slot.index === insertIndex)
      : resolveDefaultSofaInsertionSlot(
          validSlots,
          selectedModuleIds,
          sofaProduct
        );

    if (!selectedSlot && validSlots.length > 1) {
      setPendingSofaModuleId(moduleId);
      return;
    }

    if (!selectedSlot) {
      return;
    }

    const safeInsertIndex = Math.min(
      Math.max(selectedSlot.index, 0),
      selectedModuleEntries.length
    );
    const newEntry = createSofaModuleEntry(
      moduleId,
      resolvePlacementSide(selectedSlot, nextModule)
    );
    const nextModuleEntries = [
      ...selectedModuleEntries.slice(0, safeInsertIndex),
      newEntry,
      ...selectedModuleEntries.slice(safeInsertIndex),
    ];
    const collisionIndex = findCollidingSofaModuleIndex(
      nextModuleEntries,
      safeInsertIndex,
      sofaProduct
    );

    if (collisionIndex >= 0) {
      setPendingSofaModuleId("");
      return;
    }

    setSelectedModuleEntries(nextModuleEntries);
    setSelectedSofaModuleIndex(safeInsertIndex);
    setPendingSofaModuleId("");
  };

  const handleRemoveSofaModule = (indexToRemove) => {
    setPendingSofaModuleId("");
    setSelectedSofaModuleIndex(null);
    setSelectedModuleEntries((currentModuleEntries) => {
      if (
        indexToRemove < 0 ||
        indexToRemove >= currentModuleEntries.length ||
        currentModuleEntries.length <= 1
      ) {
        return currentModuleEntries;
      }

      return currentModuleEntries.filter((_, index) => index !== indexToRemove);
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section className="relative min-h-[520px] overflow-hidden lg:min-h-screen">
          <ProductScene
            product={product}
            selectedTop={selectedTop}
            selectedLegs={selectedLegs}
            selectedModuleIds={selectedModuleIds}
            selectedModuleEntries={selectedModuleEntries}
            selectedVariant={selectedVariant}
            pendingSofaInsertionSlots={pendingSofaInsertionSlots}
            onSelectSofaInsertionSlot={(insertIndex) =>
              handleAddSofaModuleAtIndex(pendingSofaModuleId, insertIndex)
            }
            selectedSofaModuleIndex={selectedSofaModuleIndex}
            onSelectSofaModule={setSelectedSofaModuleIndex}
            onRemoveSofaModule={handleRemoveSofaModule}
            panMode={panMode}
            showDimensions={showDimensions}
          />
          <FloatingViewerToolbar
            panMode={panMode}
            showDimensions={showDimensions}
            onTogglePan={() => setPanMode((current) => !current)}
            onToggleDimensions={() => setShowDimensions((current) => !current)}
            onReset={handleReset}
          />
          <PricePill totalPrice={totalPrice} />
        </section>

        <ConfigSidebar
          product={product}
          selectedTableTypeId={selectedTableTypeId}
          selectedTop={selectedTop}
          selectedLegs={selectedLegs}
          selectedTopId={selectedTopId}
          selectedLegsId={selectedLegsId}
          selectedModuleIds={selectedModuleIds}
          selectedVariant={selectedVariant}
          selectedVariantOption={selectedVariantOption}
          pendingSofaModuleId={pendingSofaModuleId}
          disabledSofaOptionIds={disabledSofaOptionIds}
          sofaDimensions={sofaDimensions}
          totalPrice={totalPrice}
          onSelectTableType={setSelectedTableTypeId}
          onSelectTopMaterial={handleSelectTopMaterial}
          onSelectLegsMaterial={handleSelectLegsMaterial}
          onSelectTop={setSelectedTopId}
          onSelectLegs={setSelectedLegsId}
          onAddSofaModule={handleAddSofaModuleAtIndex}
          onRemoveSofaModule={handleRemoveSofaModule}
          onSelectSofaVariant={setSelectedVariant}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
