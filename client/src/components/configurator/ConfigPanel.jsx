// src/components/configurator/ConfigPanel.jsx

import clsx from "clsx";
import { calculateTablePrice } from "../../utils/priceCalculator";

function OptionButton({ active, title, subtitle, price, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full rounded-2xl border p-4 text-left transition",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-200 bg-white hover:border-black"
      )}
    >
      <div className="font-semibold">{title}</div>
      <div className={clsx("text-sm", active ? "text-neutral-300" : "text-neutral-500")}>
        {subtitle}
      </div>
      {price > 0 && (
        <div className={clsx("mt-1 text-sm", active ? "text-neutral-200" : "text-neutral-600")}>
          + ₹{price.toLocaleString("en-IN")}
        </div>
      )}
    </button>
  );
}

function BackgroundOptionButton({
  active,
  title,
  subtitle,
  previewClassName,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-2xl border p-3 text-left transition",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-200 bg-white hover:border-black"
      )}
    >
      <div
        className={clsx(
          "mb-3 h-16 rounded-xl border",
          previewClassName,
          active ? "border-white/15" : "border-black/10"
        )}
      />
      <div className="font-semibold">{title}</div>
      <div
        className={clsx(
          "text-sm",
          active ? "text-neutral-300" : "text-neutral-500"
        )}
      >
        {subtitle}
      </div>
    </button>
  );
}

export default function ConfigPanel({
  product,
  selectedTop,
  selectedLegs,
  canvasBackgroundOptions,
  selectedBackgroundId,
  onSelectTop,
  onSelectLegs,
  onSelectBackground,
  onReset,
}) {
  const totalPrice = calculateTablePrice(product, selectedTop, selectedLegs);
  const selectedBackground = canvasBackgroundOptions.find(
    (background) => background.id === selectedBackgroundId
  );

  return (
    <aside className="min-h-0 rounded-3xl bg-white p-6 shadow-sm lg:h-full lg:overflow-y-auto">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          3D Configurator
        </p>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Select tabletop and leg design to preview the final product.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-neutral-100 p-4">
        <div className="text-sm text-neutral-500">Total Price</div>
        <div className="text-3xl font-bold">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 font-semibold">Canvas Background</h2>
          <div className="grid grid-cols-2 gap-3">
            {canvasBackgroundOptions.map((background) => (
              <BackgroundOptionButton
                key={background.id}
                active={selectedBackgroundId === background.id}
                title={background.name}
                subtitle={background.description}
                previewClassName={
                  background.id === "dark"
                    ? "bg-[radial-gradient(circle_at_top,_#4b5563_0%,_#1f2937_42%,_#09090b_100%)]"
                    : "bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#e5e7eb_46%,_#cbd5e1_100%)]"
                }
                onClick={() => onSelectBackground(background.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Table Top</h2>
          <div className="grid gap-3">
            {product.tops.map((top) => (
              <OptionButton
                key={top.id}
                active={selectedTop?.id === top.id}
                title={top.name}
                subtitle={`${top.shape} / ${top.material}`}
                price={top.price}
                onClick={() => onSelectTop(top.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Table Legs</h2>
          <div className="grid gap-3">
            {product.legs.map((legs) => (
              <OptionButton
                key={legs.id}
                active={selectedLegs?.id === legs.id}
                title={legs.name}
                subtitle={`${legs.shape} / ${legs.material}`}
                price={legs.price}
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
          Canvas: {selectedBackground?.name}
        </div>
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
