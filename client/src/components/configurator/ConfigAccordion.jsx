import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ConfigAccordion({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="my-3 rounded-2xl bg-[#f8f7f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(0,0,0,0.045)] ring-1 ring-black/6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-800 shadow-sm shadow-black/5 ring-1 ring-black/6 [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-neutral-950">
              {title}
            </h2>

            <div className="rounded-full bg-white p-1.5 text-neutral-500 shadow-sm shadow-black/5 ring-1 ring-black/6">
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>

          {subtitle ? (
            <p className="mt-1 truncate text-xs text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
      </button>

      <div
        className={clsx(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}
