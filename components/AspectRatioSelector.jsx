import { useState } from "react";
import { Square, RectangleHorizontal, RectangleVertical } from "lucide-react";

const aspectRatios = [
  { label: "Square", value: "1:1", icon: Square },
  { label: "Landscape", value: "16:9", icon: RectangleHorizontal },
  { label: "Portrait", value: "9:16", icon: RectangleVertical }
];

export default function AspectRatioSelector({ onSelect }) {
  const [selected, setSelected] = useState(aspectRatios[0].value);

  const handleSelect = (value) => {
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <div
        role="radiogroup"
        className="grid grid-cols-3 gap-2"
      >
        {aspectRatios.map(({ label, value, icon: Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(value)}
              className={`items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors px-3 flex flex-col h-auto py-2 overflow-hidden border border-opacity-30 bg-base-50 hover:bg-base-100 hover:text-base-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-950 focus-visible:ring-offset-2 dark:ring-offset-base-950 dark:hover:bg-base-800 dark:hover:text-base-400 dark:focus-visible:ring-base-300
                ${isSelected
                  ? "bg-secondary bg-opacity-20 border-secondary text-base-900 dark:bg-base-800 dark:text-base-50"
                  : ""}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <div className="text-sm text-base-500 font-normal">{label}</div>
              <div className="text-[10px] text-base-400">{value}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
