import { useState } from "react";

export default function PresetPicker({ presets = [], onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (preset) => {
    setSelected(preset);
    onSelect?.(preset);
  };

  return (
    <div className="w-full">
      {/* Scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelect(p)}
            className={`flex-shrink-0 w-36 rounded-lg overflow-hidden border-2 transition 
              ${selected?.name === p.name ? "border-blue-500" : "border-transparent"}`}
          >
            <img src={p.img} alt={p.name} className="w-full h-36 object-cover" />
            <div className="text-center text-sm py-1">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Selected info */}
      {selected && (
        <div className="mt-3 text-sm">
          Selected: <span className="font-semibold">{selected.name}</span>
        </div>
      )}
    </div>
  );
}
