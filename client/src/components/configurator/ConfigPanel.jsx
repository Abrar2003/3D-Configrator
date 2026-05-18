// src/components/configurator/ConfigPanel.jsx

import clsx from "clsx";
import { calculateTablePrice } from "../../utils/priceCalculator";

function ThumbnailOptionCard({ active, title, imageUrl, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      aria-pressed={active}
      className={clsx(
        "group flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent p-0 transition",
        active
          ? "scale-95 shadow-xl shadow-black/25"
          : "shadow-md shadow-black/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      )}
    >
      <div
        className={clsx(
          "flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white",
          active ? "shadow-inner shadow-black/10" : "group-hover:bg-[#fbfaf7]"
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
        )}
      </div>
    </button>
  );
}

export default function ConfigPanel({
  product,
  selectedTop,
  selectedLegs,
  onSelectTop,
  onSelectLegs,
  onReset,
}) {
  const totalPrice = calculateTablePrice(product, selectedTop, selectedLegs);

  return (
    <aside className="h-screen overflow-y-auto rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          3D Configurator
        </p>

        <h1 className="text-2xl font-bold">{product.name}</h1>

        <p className="mt-2 text-sm text-neutral-500">
          Select tabletop and leg design to preview your custom table.
        </p>
      </div>

      <div className="sticky top-0 z-10 mb-6 rounded-2xl bg-neutral-100 p-4">
        <div className="text-sm text-neutral-500">Total Price</div>

        <div className="text-3xl font-bold">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Table Top</h2>
            <span className="text-xs text-neutral-500">
              {product.tops.length} options
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {product.tops.map((top) => (
              <ThumbnailOptionCard
                key={top.id}
                active={selectedTop?.id === top.id}
                title={top.name}
                imageUrl={top.thumbnailUrl}
                onClick={() => onSelectTop(top.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Table Legs</h2>
            <span className="text-xs text-neutral-500">
              {product.legs.length} options
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {product.legs.map((legs) => (
              <ThumbnailOptionCard
                key={legs.id}
                active={selectedLegs?.id === legs.id}
                title={legs.name}
                imageUrl={legs.thumbnailUrl}
                onClick={() => onSelectLegs(legs.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 rounded-2xl border border-neutral-300 px-4 py-3 font-semibold hover:bg-neutral-100"
        >
          Reset
        </button>

        <button className="flex-1 rounded-2xl bg-black px-4 py-3 font-semibold text-white hover:bg-neutral-800">
          Generate Quote
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 p-4 text-sm">
        <div className="font-semibold">Current Selection</div>

        <div className="mt-2 text-neutral-600">
          Top: {selectedTop?.name}
        </div>

        <div className="text-neutral-600">
          Legs: {selectedLegs?.name}
        </div>
      </div>
    </aside>
  );
}
