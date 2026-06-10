import {
  Armchair,
  GitBranch,
  LayoutGrid,
  Lock,
  Minus,
  Palette,
  Receipt,
  Square,
  Undo2,
} from "lucide-react";
import ConfigAccordion from "./ConfigAccordion";
import OptionCard from "./OptionCard";
import { formatPrice } from "../../utils/priceCalculator";
import { getSelectedSofaModules } from "../../utils/sofaConfig";

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

function SofaSwatch({ active, imageUrl, colorHex, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-white p-0.5 transition ${
        active
          ? "scale-95 shadow-xl shadow-black/25"
          : "shadow-md shadow-black/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      }`}
    >
      <span
        className={`block h-full w-full overflow-hidden rounded-full ${
          active ? "ring-2 ring-black ring-offset-2 ring-offset-[#faf9f5]" : ""
        }`}
        style={{ backgroundColor: colorHex ?? "#d8d8d8" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
    </button>
  );
}

function SofaModuleOption({
  module,
  count,
  disabled,
  pending,
  onAdd,
  onRemoveLast,
}) {
  const selected = count > 0;

  return (
    <div className="relative flex w-[104px] shrink-0 flex-col items-center text-center">
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-label={module.name}
        aria-pressed={selected}
        className={`group relative flex w-full flex-col items-center bg-transparent p-0 transition duration-200 ${
          disabled
            ? "cursor-not-allowed opacity-45"
            : selected
              ? "scale-[0.98]"
              : "hover:-translate-y-0.5"
        }`}
      >
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-white transition duration-200 ${
            selected
              ? "border-[3px] border-[#d9aa3a] shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
              : "shadow-[0_10px_24px_rgba(0,0,0,0.10)] group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
          }`}
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            {module.thumbnailUrl ? (
              <img
                src={module.thumbnailUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-neutral-200" />
            )}
          </span>

          {disabled ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/58 text-neutral-800">
              <Lock className="h-5 w-5" />
            </span>
          ) : null}

          {count > 0 ? (
            <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-semibold text-white ring-2 ring-white">
              {count}
            </span>
          ) : null}
        </div>

        <span className="mt-2 min-h-[30px] text-xs font-semibold leading-[15px] text-neutral-950">
          {module.name}
        </span>
        <span className="mt-1 text-[11px] font-medium text-neutral-500">
          {module.dimensionsLabel}
        </span>
      </button>

      {pending ? (
        <div className="mt-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-900">
          Choose position in view
        </div>
      ) : null}

      {count > 0 ? (
        <button
          type="button"
          onClick={onRemoveLast}
          disabled={count <= 0}
          aria-label={`Remove ${module.name}`}
          className="mt-2 inline-flex h-7 items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 text-[11px] font-semibold text-neutral-700 shadow-sm shadow-black/5 transition hover:border-black/20 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3 w-3" />
          Remove
        </button>
      ) : null}
    </div>
  );
}

function formatDimensions(dimensions) {
  return `${Math.round(dimensions.widthCm)}W x ${Math.round(
    dimensions.depthCm
  )}D x ${Math.round(dimensions.heightCm)}H cm`;
}

function SofaSidebar({
  product,
  selectedModuleIds,
  selectedVariant,
  selectedVariantOption,
  pendingSofaModuleId,
  disabledSofaOptionIds,
  sofaDimensions,
  totalPrice,
  onAddSofaModule,
  onRemoveSofaModule,
  onSelectSofaVariant,
  onReset,
}) {
  const selectedModules = getSelectedSofaModules(selectedModuleIds, product);
  const moduleCounts = selectedModuleIds.reduce((counts, moduleId) => {
    counts.set(moduleId, (counts.get(moduleId) ?? 0) + 1);
    return counts;
  }, new Map());

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
                Configure Your Sofa
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                Build a modular layout, then choose the fabric finish.
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
            title="Sofa Elements"
            subtitle={`${selectedModuleIds.length} selected`}
            icon={<Armchair className="h-5 w-5" />}
            defaultOpen
          >
            <div className="grid gap-5">
              {product.moduleGroups.map((group) => {
                const modules = product.modules.filter(
                  (module) => module.groupId === group.id
                );

                return (
                  <div key={group.id}>
                    <div className="mb-3 border-b border-black/15 pb-1 text-sm font-semibold text-neutral-950">
                      {group.name}
                    </div>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                      {modules.map((module) => {
                        const count = moduleCounts.get(module.id) ?? 0;
                        const disabled = disabledSofaOptionIds.has(module.id);
                        const lastSelectedIndex = selectedModuleIds.lastIndexOf(module.id);

                        return (
                          <SofaModuleOption
                            key={module.id}
                            module={module}
                            count={count}
                            disabled={disabled}
                            pending={pendingSofaModuleId === module.id}
                            onAdd={() => onAddSofaModule(module.id)}
                            onRemoveLast={() => onRemoveSofaModule(lastSelectedIndex)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Material / Colour Variant"
            subtitle={selectedVariantOption?.label}
            icon={<Palette className="h-5 w-5" />}
            defaultOpen
          >
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <SofaSwatch
                  key={variant.id}
                  active={selectedVariant === variant.id}
                  imageUrl={variant.thumbnailUrl}
                  colorHex={variant.colorHex}
                  label={variant.label}
                  onClick={() => onSelectSofaVariant(variant.id)}
                />
              ))}
            </div>
          </ConfigAccordion>

          <ConfigAccordion
            title="Overview"
            subtitle={formatPrice(totalPrice)}
            icon={<Receipt className="h-5 w-5" />}
            defaultOpen
          >
            <div className="rounded-2xl bg-white/65 p-3.5 shadow-sm shadow-black/5 ring-1 ring-black/6">
              <SummaryRow label="Product" value={product.name} />
              <SummaryRow
                label="Modules"
                value={selectedModules.map((module) => module.name).join(", ") || "-"}
              />
              <SummaryRow label="Variant" value={selectedVariantOption?.label ?? "-"} />
              <SummaryRow label="Dimensions" value={formatDimensions(sofaDimensions)} />
              <div className="my-3 grid gap-2">
                {selectedModules.map((module, index) => (
                  <div
                    key={`${module.id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-950">
                        {module.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {module.dimensionsLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSofaModule(index)}
                      disabled={selectedModuleIds.length <= 1}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-neutral-700 transition hover:border-black/20 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove ${module.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="my-2 border-t border-black/8" />
              <SummaryRow label="Base Price" value={formatPrice(product.basePrice)} />
              <SummaryRow
                label="Modules Price"
                value={formatPrice(
                  selectedModules.reduce((total, module) => total + module.price, 0)
                )}
              />
              <SummaryRow label="Variant Price" value={formatPrice(selectedVariantOption?.price ?? 0)} />
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

export default function ConfigSidebar({
  product,
  selectedTableTypeId,
  selectedTop,
  selectedLegs,
  selectedTopId,
  selectedLegsId,
  selectedModuleIds,
  selectedVariant,
  selectedVariantOption,
  pendingSofaModuleId,
  disabledSofaOptionIds,
  sofaDimensions,
  totalPrice,
  onSelectTableType,
  onSelectTopMaterial,
  onSelectLegsMaterial,
  onSelectTop,
  onSelectLegs,
  onAddSofaModule,
  onRemoveSofaModule,
  onSelectSofaVariant,
  onReset,
}) {
  if (product.productType === "sofa") {
    return (
      <SofaSidebar
        product={product}
        selectedModuleIds={selectedModuleIds}
        selectedVariant={selectedVariant}
        selectedVariantOption={selectedVariantOption}
        pendingSofaModuleId={pendingSofaModuleId}
        disabledSofaOptionIds={disabledSofaOptionIds}
        sofaDimensions={sofaDimensions}
        totalPrice={totalPrice}
        onAddSofaModule={onAddSofaModule}
        onRemoveSofaModule={onRemoveSofaModule}
        onSelectSofaVariant={onSelectSofaVariant}
        onReset={onReset}
      />
    );
  }

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
