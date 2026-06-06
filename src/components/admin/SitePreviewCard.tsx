"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface Props {
  siteUrl: string;
}

const IFRAME_W = 390;
const IFRAME_H = Math.round(IFRAME_W * 16 / 9); // 693px — proporção 9:16

export function SitePreviewCard({ siteUrl }: Props) {
  const [clicked, setClicked] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 0) setScale(width / IFRAME_W);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative border border-nyx-line flex flex-col cursor-pointer group min-w-0 overflow-hidden"
      onClick={() => setClicked(true)}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-nyx-line shrink-0 flex items-center justify-between">
        <p className="label-mono text-[10px] text-nyx-muted">Site do cliente</p>
        <span className="label-mono text-[9px] text-nyx-soft">NYX</span>
      </div>

      {/* Container 9:16 com scale dinâmico */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ height: Math.round(IFRAME_H * scale) }}
      >
        <iframe
          src={siteUrl}
          title="Preview do site"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: IFRAME_W,
            height: IFRAME_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: "none",
            pointerEvents: "none",
          }}
          tabIndex={-1}
        />

        {/* Hover tint */}
        {!clicked && (
          <div className="absolute inset-0 bg-transparent group-hover:bg-nyx-bg/10 transition-colors duration-200" />
        )}
      </div>

      {/* Overlay ao clicar */}
      {clicked && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-nyx-bg/75 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="label-mono text-[10px] text-nyx-muted">NYX — site da cliente</p>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-nyx-ink text-nyx-bg px-6 py-3 label-mono text-xs hover:bg-nyx-muted transition-colors"
          >
            <ExternalLink size={13} />
            Acessar o site
          </a>
          <button
            type="button"
            onClick={() => setClicked(false)}
            className="label-mono text-[9px] text-nyx-soft hover:text-nyx-muted transition-colors"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
