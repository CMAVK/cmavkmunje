"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa6";

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <FaStar
            className={`h-7 w-7 ${
              (hover || value) >= n ? "text-gold" : "text-black/15"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar key={n} className={`${size} ${value >= n ? "text-gold" : "text-black/15"}`} />
      ))}
    </div>
  );
}
