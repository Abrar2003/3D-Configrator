import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ConfigAccordion({
  title,
  subtitle,
  stepLabel,
  icon,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-black/8">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 py-5 text-left"
      >
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-[#faf9f5] text-neutral-800">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                {stepLabel}
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                {title}
              </h2>
            </div>

            <div className="mt-1 rounded-full border border-black/8 p-2 text-neutral-600">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          {subtitle ? (
            <p className="mt-2 text-sm leading-6 text-neutral-500">{subtitle}</p>
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
          <div className="pb-6 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}
