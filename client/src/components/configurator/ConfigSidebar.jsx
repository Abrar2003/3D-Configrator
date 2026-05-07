import { GitBranch, LayoutGrid, Palette, Receipt, Square, Undo2 } from "lucide-react";
import ConfigAccordion from "./ConfigAccordion";
import OptionCard from "./OptionCard";
import { formatPrice } from "../../utils/priceCalculator";

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

        <div className="flex-1 overflow-y-auto px-5 pb-8 sm:px-6 lg:px-8">
          <ConfigAccordion
            title="Type Table"
            subtitle={selectedTableType?.name}
            stepLabel="Step 1/5"
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
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-black bg-[#faf9f4] shadow-sm shadow-black/5"
                        : "border-black/8 bg-white hover:border-black/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-neutral-950">
                          {tableType.name}
                        </div>
                        <div className="mt-1 text-sm text-neutral-500">
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
            stepLabel="Step 2/5"
            icon={<Palette className="h-5 w-5" />}
          >
            <div className="rounded-3xl border border-black/8 bg-[#faf9f5] p-4">
              <p className="text-sm leading-6 text-neutral-500">
                Choose finishes first, then select from the shapes available for each material.
              </p>

              <div className="mt-5">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Table Top Finish
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topMaterials.map((material) => {
                    const active = material === selectedTop?.material;

                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => onSelectTopMaterial(material)}
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-black/10 bg-white text-neutral-600 hover:border-black/25"
                        }`}
                      >
                        {material}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Leg Finish
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {legMaterials.map((material) => {
                    const active = material === selectedLegs?.material;

                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => onSelectLegsMaterial(material)}
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-black/10 bg-white text-neutral-600 hover:border-black/25"
                        }`}
                      >
                        {material}
                      </button>
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
            stepLabel="Step 3/5"
            icon={<Square className="h-5 w-5" />}
            defaultOpen
          >
            <div className="grid grid-cols-2 gap-3">
              {visibleTops.map((top) => (
                <OptionCard
                  key={top.id}
                  active={selectedTopId === top.id}
                  title={top.shape}
                  subtitle=""
                  imageUrl={top.thumbnailUrl}
                  price={top.price}
                  onClick={() => onSelectTop(top.id)}
                  compact
                />
              ))}
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Table Legs"
            subtitle={
              selectedLegs
                ? `${selectedLegs.material} • ${selectedLegs.shape}`
                : "Choose a leg shape"
            }
            stepLabel="Step 4/5"
            icon={<GitBranch className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 gap-3">
              {visibleLegs.map((legsOption) => (
                <OptionCard
                  key={legsOption.id}
                  active={selectedLegsId === legsOption.id}
                  title={legsOption.shape}
                  subtitle=""
                  imageUrl={legsOption.thumbnailUrl}
                  price={legsOption.price}
                  onClick={() => onSelectLegs(legsOption.id)}
                  compact
                />
              ))}
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Summary"
            subtitle={formatPrice(totalPrice)}
            stepLabel="Step 5/5"
            icon={<Receipt className="h-5 w-5" />}
          >
            <div className="rounded-3xl border border-black/8 bg-[#faf9f5] p-4">
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
                className="mt-5 w-full rounded-full bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
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
