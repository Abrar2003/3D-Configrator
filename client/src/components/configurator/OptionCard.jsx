import clsx from "clsx";
import { Info } from "lucide-react";

export default function OptionCard({
  active = false,
  title,
  imageUrl,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      aria-pressed={active}
      className={clsx(
        "group relative flex w-[88px] shrink-0 flex-col items-center bg-transparent p-0 text-center transition duration-200",
        active ? "scale-[0.98]" : "hover:-translate-y-0.5"
      )}
    >
      <div
        className={clsx(
          "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white transition duration-200",
          active
            ? "border-[3px] border-[#d9aa3a] shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
            : "shadow-[0_10px_24px_rgba(0,0,0,0.10)] group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
        )}

        <span className="absolute bottom-1 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-white text-neutral-800 shadow-sm ring-1 ring-black/35">
          <Info className="h-3 w-3" strokeWidth={2} />
        </span>

      </div>

      <span className="mt-2 min-h-[30px] text-xs font-semibold leading-[15px] text-neutral-950">
        {title}
      </span>
    </button>
  );
}
