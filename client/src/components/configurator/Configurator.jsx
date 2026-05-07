// src/components/configurator/Configurator.jsx

import { useMemo, useState } from "react";
import { tableProduct } from "../../data/tableProduct";
import ProductScene from "./ProductScene";
import ConfigPanel from "./ConfigPanel";

const canvasBackgroundOptions = [
  {
    id: "light",
    name: "Light",
    description: "Bright studio backdrop",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Showroom night backdrop",
  },
];

const defaultCanvasBackground = "light";

export default function Configurator() {
  const product = tableProduct;

  const [selectedTopId, setSelectedTopId] = useState(product.defaultConfig.top);
  const [selectedLegsId, setSelectedLegsId] = useState(product.defaultConfig.legs);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(
    defaultCanvasBackground
  );

  const selectedTop = useMemo(
    () => product.tops.find((top) => top.id === selectedTopId),
    [product.tops, selectedTopId]
  );

  const selectedLegs = useMemo(
    () => product.legs.find((legs) => legs.id === selectedLegsId),
    [product.legs, selectedLegsId]
  );

  const handleReset = () => {
    setSelectedTopId(product.defaultConfig.top);
    setSelectedLegsId(product.defaultConfig.legs);
    setSelectedBackgroundId(defaultCanvasBackground);
  };

  return (
    <main className="min-h-screen bg-neutral-200 p-6 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:h-full lg:grid-cols-[1fr_420px]">
        <div className="lg:sticky lg:top-0 lg:h-full">
          <ProductScene
            selectedTop={selectedTop}
            selectedLegs={selectedLegs}
            backgroundMode={selectedBackgroundId}
          />
        </div>

        <ConfigPanel
          product={product}
          selectedTop={selectedTop}
          selectedLegs={selectedLegs}
          canvasBackgroundOptions={canvasBackgroundOptions}
          selectedBackgroundId={selectedBackgroundId}
          onSelectTop={setSelectedTopId}
          onSelectLegs={setSelectedLegsId}
          onSelectBackground={setSelectedBackgroundId}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
