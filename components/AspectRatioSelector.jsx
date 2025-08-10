'use client';
import { useState } from "react";
import { Square, RectangleHorizontal, RectangleVertical } from "lucide-react";

const aspectRatios = [
  { label: "Square", value: "1:1", icon: Square },
  { label: "Landscape", value: "16:9", icon: RectangleHorizontal },
  { label: "Portrait", value: "9:16", icon: RectangleVertical },
];

export default function AspectRatioSelector({ onSelect }) {
  const [selected, setSelected] = useState(aspectRatios[0].value);

  const handleSelect = (value) => {
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <div role="radiogroup" className="grid grid-cols-3 gap-2">
        {aspectRatios.map(({ label, value, icon: Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(value)}
              className={[
                "items-center justify-center rounded-md text-sm font-medium transition-colors",
                "px-3 flex flex-col h-auto py-2 overflow-hidden border",
                "bg-white hover:bg-slate-50 border-slate-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                isSelected ? "ring-2 ring-emerald-400" : "",
                "text-slate-700 dark:text-slate-200", // <-- ensures Lucide's currentColor is visible
              ].join(" ")}
            >
              <Icon className="w-6 h-6 mb-1" strokeWidth={2} />
              <div className="text-sm text-slate-600 dark:text-slate-300 font-normal">{label}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-400">{value}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
