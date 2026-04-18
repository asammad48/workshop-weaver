interface ReportRow {
  jobCardId?: string;
  createdAt?: Date;
  status?: string;
  customerName?: string;
  customerType?: string;
  vehiclePlate?: string;
}

type SupportedLanguage = "en" | "es";

interface Labels {
  title: string;
  generatedAt: string;
  totalRecords: string;
  department: string;
  no: string;
  id: string;
  date: string;
  status: string;
  unit: string;
  technician: string;
  type: string;
  footerBrand: string;
  confidential: string;
  page: string;
  of: string;
}

const LABELS: Record<SupportedLanguage, Labels> = {
  en: {
    title: "Work Orders Report",
    generatedAt: "Generated",
    totalRecords: "Total Records",
    department: "Department",
    no: "#",
    id: "ID",
    date: "Date",
    status: "Status",
    unit: "Unit",
    technician: "Technician",
    type: "Type",
    footerBrand: "Workshop Management",
    confidential: "Confidential",
    page: "Page",
    of: "of",
  },
  es: {
    title: "Reporte de Ordenes de Trabajo",
    generatedAt: "Generado",
    totalRecords: "Total de registros",
    department: "Departamento",
    no: "#",
    id: "ID",
    date: "Fecha",
    status: "Estado",
    unit: "Unidad",
    technician: "Tecnico",
    type: "Tipo",
    footerBrand: "Workshop Management",
    confidential: "Confidencial",
    page: "Pagina",
    of: "de",
  },
};

type Rgb = [number, number, number];

interface PdfPalette {
  primary: Rgb;
  primaryDark: Rgb;
  ink: Rgb;
  muted: Rgb;
  soft: Rgb;
  border: Rgb;
}

function parseCssColor(value: string | null, fallback: Rgb): Rgb {
  if (!value) return fallback;
  const clean = value.trim();
  if (clean.startsWith("#")) {
    const hex = clean.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    if (full.length === 6) {
      return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
      ];
    }
  }
  const rgbMatch = clean.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1].split(",").slice(0, 3).map((v) => Number(v.trim()));
    if ([r, g, b].every(Number.isFinite)) return [r, g, b];
  }
  return fallback;
}

function getThemePalette(): PdfPalette {
  const fallback: PdfPalette = {
    primary: [245, 158, 11],
    primaryDark: [180, 83, 9],
    ink: [23, 23, 23],
    muted: [115, 115, 115],
    soft: [250, 250, 249],
    border: [231, 229, 228],
  };
  if (typeof window === "undefined") return fallback;
  const style = getComputedStyle(document.documentElement);
  const primary = parseCssColor(style.getPropertyValue("--c-primary"), fallback.primary);
  const ink = parseCssColor(style.getPropertyValue("--c-text"), fallback.ink);
  const muted = parseCssColor(style.getPropertyValue("--c-muted"), fallback.muted);
  const border = parseCssColor(style.getPropertyValue("--c-border"), fallback.border);
  const soft = parseCssColor(style.getPropertyValue("--c-bg"), fallback.soft);
  return {
    primary,
    primaryDark: [Math.floor(primary[0] * 0.72), Math.floor(primary[1] * 0.72), Math.floor(primary[2] * 0.72)],
    ink,
    muted,
    border,
    soft,
  };
}

function rgbFill([r, g, b]: Rgb): string {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`;
}

function rgbStroke([r, g, b]: Rgb): string {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`;
}

function sanitizePdfText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/—/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value: string): string {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function text(x: number, y: number, size: number, content: string): string {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(content)}) Tj ET`;
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}...`;
}

function statusColor(status: string, palette: PdfPalette): Rgb {
  const s = status.toLowerCase();
  if (s.includes("complet") || s.includes("paid") || s.includes("pagad")) return [22, 101, 52];
  if (s.includes("progreso") || s.includes("progress")) return palette.primaryDark;
  if (s.includes("cancel")) return [153, 27, 27];
  return [30, 64, 175];
}

function buildStyledPdf(rows: ReportRow[], from: string | undefined, to: string | undefined, language: SupportedLanguage): string {
  const l = LABELS[language];
  const palette = getThemePalette();
  const now = new Date();
  const generatedAt = `${l.generatedAt}: ${now.toLocaleString(language === "es" ? "es-ES" : "en-US")}`;
  const dateRange = from || to ? `${from || "-"} - ${to || "-"}` : "-";

  const pageW = 595;
  const pageH = 842;
  const margin = 40;
  const commands: string[] = [];

  commands.push(rgbFill([244, 244, 245]));
  commands.push(`0 0 ${pageW} ${pageH} re f`);

  commands.push(rgbFill(palette.primary));
  commands.push("0 730 595 110 re f");
  commands.push(rgbFill(palette.primaryDark));
  commands.push("0 726 595 4 re f");

  commands.push(rgbFill(palette.ink));
  commands.push("40 753 56 56 re f");
  commands.push("1 1 1 rg");
  commands.push(text(59, 782, 26, "W"));

  commands.push(rgbFill(palette.ink));
  commands.push(text(108, 798, 10, "WORKSHOP MANAGEMENT"));
  commands.push(text(108, 776, 20, l.title));
  commands.push(text(108, 758, 11, dateRange));

  const metaY = 696;
  commands.push(rgbFill(palette.muted));
  commands.push(text(40, metaY, 9, l.generatedAt.toUpperCase()));
  commands.push(text(240, metaY, 9, l.totalRecords.toUpperCase()));
  commands.push(text(420, metaY, 9, l.department.toUpperCase()));

  commands.push(rgbFill(palette.ink));
  commands.push(text(40, metaY - 16, 11, generatedAt));
  commands.push(text(240, metaY - 16, 11, String(rows.length)));
  commands.push(text(420, metaY - 16, 11, "Fleet & Maintenance"));

  commands.push(rgbStroke(palette.border));
  commands.push("0.7 w");
  commands.push(`40 ${metaY - 30} m ${pageW - margin} ${metaY - 30} l S`);

  const headerY = metaY - 58;
  const rowHeight = 50;
  const tableX = 40;
  const tableW = 515;
  const colBounds = [40, 74, 140, 204, 286, 360, 476, 555];

  commands.push(rgbStroke(palette.border));
  commands.push("0.5 w");
  commands.push(`${tableX} ${headerY - 32 - rowHeight * Math.min(rows.length, 10)} ${tableW} ${32 + rowHeight * Math.min(rows.length, 10)} re S`);

  commands.push(rgbFill(palette.ink));
  commands.push(`${tableX} ${headerY} ${tableW} 32 re f`);
  commands.push(rgbFill(palette.primary));
  commands.push(text(50, headerY + 12, 10, l.no));
  commands.push(text(78, headerY + 12, 10, l.id));
  commands.push(text(140, headerY + 12, 10, l.date));
  commands.push(text(205, headerY + 12, 10, l.status));
  commands.push(text(288, headerY + 12, 10, l.unit));
  commands.push(text(360, headerY + 12, 10, l.technician));
  commands.push(text(492, headerY + 12, 10, l.type));

  commands.push(rgbStroke([214, 211, 209]));
  commands.push("0.5 w");
  colBounds.forEach((x) => {
    commands.push(`${x} ${headerY - 32 - rowHeight * Math.min(rows.length, 10)} m ${x} ${headerY + 32} l S`);
  });

  const visibleRows = rows.slice(0, 10);
  visibleRows.forEach((item, idx) => {
    const topY = headerY - 1 - idx * rowHeight;

    if (idx % 2 === 0) {
      commands.push(rgbFill(palette.soft));
      commands.push(`40 ${topY - rowHeight} 515 ${rowHeight} re f`);
    }

    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US") : "-";
    const status = item.status || "-";

    commands.push(rgbFill(palette.muted));
    commands.push(text(50, topY - 28, 10, String(idx + 1).padStart(2, "0")));

    commands.push(rgbFill(palette.ink));
    commands.push(text(78, topY - 28, 10, truncate(item.jobCardId?.slice(-8) || "-", 10)));
    commands.push(text(140, topY - 28, 10, truncate(date, 12)));

    commands.push(rgbFill(statusColor(status, palette)));
    commands.push(text(205, topY - 28, 10, truncate(status, 16)));

    commands.push(rgbFill(palette.ink));
    commands.push(text(288, topY - 28, 10, truncate(item.vehiclePlate || "-", 12)));
    commands.push(text(360, topY - 28, 10, truncate(item.customerName || "-", 22)));
    commands.push(text(492, topY - 28, 10, truncate(item.customerType || "-", 12)));

    commands.push(rgbStroke(palette.border));
    commands.push("0.5 w");
    commands.push(`40 ${topY - rowHeight} m 555 ${topY - rowHeight} l S`);
  });

  commands.push(rgbStroke(palette.border));
  commands.push("0.5 w");
  commands.push(`40 40 m 555 40 l S`);
  commands.push(rgbFill(palette.muted));
  commands.push(text(40, 24, 8, `${l.footerBrand} - ${l.confidential}`));
  commands.push(text(500, 24, 8, `${l.page} 1 ${l.of} 1`));

  const stream = commands.join("\n");
  const streamBytes = new TextEncoder().encode(stream).length;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${streamBytes} >> stream\n${stream}\nendstream endobj`,
  ];

  let content = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(new TextEncoder().encode(content).length);
    content += `${obj}\n`;
  }
  const xrefStart = new TextEncoder().encode(content).length;
  content += `xref\n0 ${objects.length + 1}\n`;
  content += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    content += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  content += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return content;
}

export function downloadJobCardsPdf(rows: ReportRow[], from?: string, to?: string, language: SupportedLanguage = "en"): void {
  const pdf = buildStyledPdf(rows, from, to, language);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `work-orders-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
