import { useMemo, useState } from "react";
import { tableProduct } from "../../data/tableProduct";
import { calculateTablePrice } from "../../utils/priceCalculator";
import ConfigSidebar from "./ConfigSidebar";
import FloatingViewerToolbar from "./FloatingViewerToolbar";
import PricePill from "./PricePill";
import ProductScene from "./ProductScene";

export default function Configurator() {
  const product = tableProduct;
  const defaultTableTypeId =
    product.defaultConfig.tableType ?? product.tableTypes[0]?.id ?? "";
  const defaultTopId = product.defaultConfig.top ?? product.tops[0]?.id ?? "";
  const defaultLegsId = product.defaultConfig.legs ?? product.legs[0]?.id ?? "";

  const [selectedTableTypeId, setSelectedTableTypeId] = useState(defaultTableTypeId);
  const [selectedTopId, setSelectedTopId] = useState(defaultTopId);
  const [selectedLegsId, setSelectedLegsId] = useState(defaultLegsId);

  const selectedTop = useMemo(
    () => product.tops.find((top) => top.id === selectedTopId) ?? product.tops[0],
    [product.tops, selectedTopId]
  );

  const selectedLegs = useMemo(
    () =>
      product.legs.find((legsOption) => legsOption.id === selectedLegsId) ??
      product.legs[0],
    [product.legs, selectedLegsId]
  );

  const totalPrice = useMemo(
    () => calculateTablePrice(product, selectedTop, selectedLegs),
    [product, selectedTop, selectedLegs]
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
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section className="relative min-h-[520px] overflow-hidden lg:min-h-screen">
          <ProductScene selectedTop={selectedTop} selectedLegs={selectedLegs} />
          <FloatingViewerToolbar onReset={handleReset} />
          <PricePill totalPrice={totalPrice} />
        </section>

        <ConfigSidebar
          product={product}
          selectedTableTypeId={selectedTableTypeId}
          selectedTop={selectedTop}
          selectedLegs={selectedLegs}
          selectedTopId={selectedTopId}
          selectedLegsId={selectedLegsId}
          totalPrice={totalPrice}
          onSelectTableType={setSelectedTableTypeId}
          onSelectTopMaterial={handleSelectTopMaterial}
          onSelectLegsMaterial={handleSelectLegsMaterial}
          onSelectTop={setSelectedTopId}
          onSelectLegs={setSelectedLegsId}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
