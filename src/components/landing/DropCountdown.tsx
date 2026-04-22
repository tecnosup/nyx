"use client";

import { useEffect, useState } from "react";

interface Props {
  releaseDate: number;
  dropName: string;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffParts(target: number): Parts | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function DropCountdown({ releaseDate, dropName }: Props) {
  const [parts, setParts] = useState<Parts | null>(() => diffParts(releaseDate));

  useEffect(() => {
    setParts(diffParts(releaseDate));
    const id = setInterval(() => setParts(diffParts(releaseDate)), 1000);
    return () => clearInterval(id);
  }, [releaseDate]);

  if (!parts) return null;

  const blocks: { value: string; label: string }[] = [
    { value: pad(parts.days), label: "Dias" },
    { value: pad(parts.hours), label: "Horas" },
    { value: pad(parts.minutes), label: "Min" },
    { value: pad(parts.seconds), label: "Seg" },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-nyx-line">
      <div className="container-nyx">
        <p className="label-mono text-nyx-muted text-center mb-8 md:mb-10">
          Próximo drop — {dropName}
        </p>
        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-3xl mx-auto">
          {blocks.map((b) => (
            <div
              key={b.label}
              className="border border-nyx-line py-6 md:py-10 text-center bg-nyx-cream/30"
            >
              <p className="heading-display text-4xl md:text-6xl text-nyx-ink tabular-nums">
                {b.value}
              </p>
              <p className="label-mono text-nyx-muted text-[10px] md:text-xs mt-2">
                {b.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
