import { GitBranch, LayoutGrid, Palette, Receipt, Square, Undo2 } from "lucide-react";
import ConfigAccordion from "./ConfigAccordion";
import OptionCard from "./OptionCard";
import { formatPrice } from "../../utils/priceCalculator";

const MATERIAL_IMAGE_BY_NAME = {
  "Natural Mango Wood": "/images/table/material/natural_mango_wood.jpeg",
  "Dark Brown Mango Wood": "/images/table/material/dark_brown_mango_wood.jpeg",
  "Black Metal": "/images/table/material/black_matel.jpeg",
  "Gold Metal": "/images/table/material/gold_metal.jpeg",
};

function SummaryRow({ label, value, emphasized = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className={emphasized ? "font-semibold text-neutral-950" : "text-right text-neutral-800"}>
        {value}
      </span>
    </div>
  );
}

function MaterialSwatch({ active, material, onClick }) {
  const imageUrl = MATERIAL_IMAGE_BY_NAME[material];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={material}
      aria-pressed={active}
      title={material}
      className={`group flex h-12 w-12 items-center justify-center rounded-full bg-white p-0.5 transition ${
        active
          ? "scale-95 shadow-xl shadow-black/25"
          : "shadow-md shadow-black/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      }`}
    >
      <span
        className={`block h-full w-full overflow-hidden rounded-full ${
          active ? "ring-2 ring-black ring-offset-2 ring-offset-[#faf9f5]" : ""
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-100 saturate-100"
          />
        ) : (
          <span className="block h-full w-full rounded-full bg-neutral-200" />
        )}
      </span>
    </button>
  );
}

export default function ConfigSidebar({
  product,
  selectedTableTypeId,
  selectedTop,
  selectedLegs,
  selectedTopId,
  selectedLegsId,
  totalPrice,
  onSelectTableType,
  onSelectTopMaterial,
  onSelectLegsMaterial,
  onSelectTop,
  onSelectLegs,
  onReset,
}) {
  const selectedTableType =
    product.tableTypes.find((type) => type.id === selectedTableTypeId) ??
    product.tableTypes[0];
  const topMaterials = [...new Set(product.tops.map((top) => top.material))];
  const legMaterials = [...new Set(product.legs.map((legsOption) => legsOption.material))];
  const visibleTops = product.tops.filter(
    (top) => top.material === selectedTop?.material
  );
  const visibleLegs = product.legs.filter(
    (legsOption) => legsOption.material === selectedLegs?.material
  );

  return (
    <aside className="border-t border-black/10 bg-white lg:h-screen lg:border-l lg:border-t-0">
      <div className="flex min-h-0 flex-col overflow-hidden lg:h-full">
        <header className="shrink-0 border-b border-black/8 px-5 pb-5 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-400">
                Premium Configurator
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                Configure Your Table
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                Customize the table top, finish, and legs.
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black/20 hover:bg-[#faf9f5]"
            >
              <Undo2 className="h-4 w-4" />
              Reset
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6 lg:px-7">
          <ConfigAccordion
            title="Type Table"
            subtitle={selectedTableType?.name}
            icon={<LayoutGrid className="h-5 w-5" />}
            defaultOpen
          >
            <div className="grid gap-3">
              {product.tableTypes.map((tableType) => {
                const active = tableType.id === selectedTableTypeId;

                return (
                  <button
                    key={tableType.id}
                    type="button"
                    onClick={() => onSelectTableType(tableType.id)}
                    className={`rounded-2xl px-3.5 py-3 text-left transition ${
                      active
                        ? "bg-white shadow-md shadow-black/8 ring-1 ring-black/8"
                        : "bg-white/70 shadow-sm shadow-black/5 ring-1 ring-black/6 hover:bg-white hover:shadow-md hover:shadow-black/8"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-neutral-950">
                          {tableType.name}
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {tableType.description}
                        </div>
                      </div>

                      <span className="rounded-full bg-black px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white">
                        {tableType.iconLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Material"
            subtitle={
              selectedTop && selectedLegs
                ? `Top: ${selectedTop.material} • Legs: ${selectedLegs.material}`
                : "Choose tabletop and leg finishes"
            }
            icon={<Palette className="h-5 w-5" />}
          >
            <div className="rounded-2xl bg-white/65 p-3.5 shadow-sm shadow-black/5 ring-1 ring-black/6">
              <p className="text-xs leading-5 text-neutral-500">
                Choose finishes first, then select from the shapes available for each material.
              </p>

              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Table Top Finish
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {topMaterials.map((material) => {
                    const active = material === selectedTop?.material;

                    return (
                      <MaterialSwatch
                        key={material}
                        active={active}
                        material={material}
                        onClick={() => onSelectTopMaterial(material)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Leg Finish
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {legMaterials.map((material) => {
                    const active = material === selectedLegs?.material;

                    return (
                      <MaterialSwatch
                        key={material}
                        active={active}
                        material={material}
                        onClick={() => onSelectLegsMaterial(material)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Table Top Shape"
            subtitle={
              selectedTop
                ? `${selectedTop.material} • ${selectedTop.shape}`
                : "Choose a tabletop shape"
            }
            icon={<Square className="h-5 w-5" />}
            defaultOpen
          >
            <div>
              <div className="mb-2 border-b border-black/15 pb-1 text-sm font-semibold text-neutral-950">
                Shape
              </div>
              <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                {visibleTops.map((top) => (
                  <OptionCard
                    key={top.id}
                    active={selectedTopId === top.id}
                    title={top.shape}
                    imageUrl={top.thumbnailUrl}
                    onClick={() => onSelectTop(top.id)}
                  />
                ))}
              </div>
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Table Legs"
            subtitle={
              selectedLegs
                ? `${selectedLegs.material} • ${selectedLegs.shape}`
                : "Choose a leg shape"
            }
            icon={<GitBranch className="h-5 w-5" />}
          >
            <div>
              <div className="mb-2 border-b border-black/15 pb-1 text-sm font-semibold text-neutral-950">
                Leg Type
              </div>
              <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                {visibleLegs.map((legsOption) => (
                  <OptionCard
                    key={legsOption.id}
                    active={selectedLegsId === legsOption.id}
                    title={legsOption.shape}
                    imageUrl={legsOption.thumbnailUrl}
                    onClick={() => onSelectLegs(legsOption.id)}
                  />
                ))}
              </div>
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Summary"
            subtitle={formatPrice(totalPrice)}
            icon={<Receipt className="h-5 w-5" />}
          >
            <div className="rounded-2xl bg-white/65 p-3.5 shadow-sm shadow-black/5 ring-1 ring-black/6">
              <SummaryRow label="Product" value={product.name} />
              <SummaryRow label="Table Type" value={selectedTableType?.name ?? "Dining Table"} />
              <SummaryRow label="Table Top Shape" value={selectedTop?.shape ?? "-"} />
              <SummaryRow label="Top Material" value={selectedTop?.material ?? "-"} />
              <SummaryRow label="Leg Shape" value={selectedLegs?.shape ?? "-"} />
              <SummaryRow label="Legs Material" value={selectedLegs?.material ?? "-"} />
              <div className="my-2 border-t border-black/8" />
              <SummaryRow label="Base Price" value={formatPrice(product.basePrice)} />
              <SummaryRow label="Top Price" value={formatPrice(selectedTop?.price ?? 0)} />
              <SummaryRow label="Legs Price" value={formatPrice(selectedLegs?.price ?? 0)} />
              <div className="my-2 border-t border-black/8" />
              <SummaryRow label="Total Price" value={formatPrice(totalPrice)} emphasized />

              <button
                type="button"
                className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Generate Quote
              </button>
            </div>
          </ConfigAccordion>
        </div>
      </div>
    </aside>
  );
}
