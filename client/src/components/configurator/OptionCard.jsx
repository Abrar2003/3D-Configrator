import clsx from "clsx";
import { Check } from "lucide-react";
import { formatPrice } from "../../utils/priceCalculator";

export default function OptionCard({
  active = false,
  title,
  subtitle,
  imageUrl,
  price = 0,
  onClick,
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-3xl border bg-white text-left transition duration-200",
        compact ? "p-3" : "p-3.5",
        active
          ? "border-black shadow-lg shadow-black/5"
          : "border-black/8 hover:border-black/40 hover:shadow-md hover:shadow-black/5"
      )}
    >
      <div
        className={clsx(
          "relative overflow-hidden rounded-2xl border",
          active ? "border-black/10 bg-[#f5f4ef]" : "border-black/6 bg-[#faf9f6]"
        )}
      >
        <div className="absolute right-3 top-3 z-10">
          <span
            className={clsx(
              "flex h-6 w-6 items-center justify-center rounded-full border transition",
              active
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white text-transparent"
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="aspect-[4/3]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Preview unavailable
            </div>
          )}
        </div>
      </div>

      <div className={clsx(compact ? "px-1 pb-1 pt-3" : "px-1 pb-1 pt-3.5")}>
        <h3 className="text-sm font-semibold tracking-[-0.01em] text-neutral-950">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-neutral-500">{subtitle}</p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-neutral-800">
          {price > 0 ? `+ ${formatPrice(price)}` : "Included"}
        </p>
      </div>
    </button>
  );
}
