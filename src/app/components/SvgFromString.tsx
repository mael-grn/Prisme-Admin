// src/app/components/SvgFromString.tsx
import React from "react";

type Props = {
    svg: string | null | undefined;
    alt?: string;
    className?: string;
};

export default function SvgFromString({ svg, alt, className }: Props) {
    if (!svg) return null;

    // Encodage sûr UTF-8 -> base64
    const base64 = typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg, "utf8").toString("base64");

    const src = `data:image/svg+xml;base64,${base64}`;

    return <img src={src} alt={alt ?? "icon"} className={className}/>;
}