// src/App.jsx

import { useState } from "react";
import { Check, ChevronLeft, Menu, X } from "lucide-react";
import Configurator from "./components/configurator/Configurator";

const PRODUCT_MENU_OPTIONS = [
  {
    id: "table",
    label: "Dining table configurator",
  },
  {
    id: "sofa",
    label: "Sofas configurator",
  },
];

export default function App() {
  const initialProductType =
    new URLSearchParams(window.location.search).get("productType") === "sofa"
      ? "sofa"
      : "table";
  const [productType, setProductType] = useState(initialProductType);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelectProduct = (nextProductType) => {
    setProductType(nextProductType);
    setMenuOpen(false);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("productType", nextProductType);
    window.history.replaceState(null, "", nextUrl);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/92 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xl shadow-black/10 backdrop-blur transition hover:bg-white"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      <Configurator productType={productType} />

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/32"
          />

          <aside className="relative flex h-full w-[min(492px,100%)] flex-col bg-white px-8 py-14 shadow-2xl shadow-black/20 sm:px-16">
            <header className="flex items-center">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-4 text-sm font-bold text-neutral-950"
              >
                <X className="h-5 w-5" />
                Close
              </button>
            </header>

            <nav className="mt-36">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="mb-9 inline-flex items-center gap-3 text-sm font-bold text-neutral-950"
              >
                <ChevronLeft className="h-4 w-4" />
                Go back
              </button>

              <div className="grid gap-6">
                {PRODUCT_MENU_OPTIONS.map((option) => {
                  const active = productType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectProduct(option.id)}
                      className="group flex items-center justify-between gap-4 text-left text-[21px] font-bold leading-tight text-neutral-950 transition hover:translate-x-1"
                    >
                      <span>{option.label}</span>
                      {active ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </nav>

          </aside>
        </div>
      ) : null}
    </>
  );
}
