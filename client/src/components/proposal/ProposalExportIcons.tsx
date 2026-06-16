/** html2canvas-safe icons for PDF export (Lucide SVGs often render as black boxes). */

const iconStyle = { display: "inline-block", verticalAlign: "middle", flexShrink: 0 } as const;

export function ExportBuildingIcon({ size = 12, color = "#dc2626" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" stroke={color} strokeWidth="2" />
      <path d="M6 12h12M10 6h4M10 10h4M10 14h4M10 18h4" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function ExportMapPinIcon({ size = 12, color = "#dc2626" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="10" r="2.5" fill={color} />
    </svg>
  );
}

export function ExportUserIcon({ size = 16, color = "#dc2626" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function ExportCheckIcon({ size = 10, color = "#16a34a" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

export function ExportXIcon({ size = 10, color = "#dc2626" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

export function ExportThumbUpIcon({ size = 12, color = "#15803d" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M7 11v10M7 11l4-8 2 3h5v5h-6l-1 0" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function ExportThumbDownIcon({ size = 12, color = "#b91c1c" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle} aria-hidden>
      <path d="M17 13V3M17 13l-4 8-2-3H6V5h6l1 0" stroke={color} strokeWidth="2" />
    </svg>
  );
}
