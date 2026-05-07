import { formatPrice } from "../../utils/priceCalculator";

export default function PricePill({ totalPrice }) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(580px,calc(100%-40px))] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/90 px-5 py-4 shadow-xl shadow-black/8 backdrop-blur md:bottom-8 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            Total Price
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Live pricing updates with every selection.
          </p>
        </div>

        <div className="text-right text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
          {formatPrice(totalPrice)}
        </div>
      </div>
    </div>
  );
}
