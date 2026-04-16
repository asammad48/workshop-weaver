interface ReportRow {
  jobCardId?: string;
  createdAt?: Date;
  status?: string;
  customerName?: string;
  customerType?: string;
  vehiclePlate?: string;
}

type SupportedLanguage = 'en' | 'es';

interface Labels {
  title: string;
  generatedAt: string;
  totalRecords: string;
  no: string;
  card: string;
  date: string;
  status: string;
  plate: string;
  customer: string;
  type: string;
  disclaimerTitle: string;
  disclaimerText: string;
}

const LABELS: Record<SupportedLanguage, Labels> = {
  en: {
    title: 'Job Cards Report',
    generatedAt: 'Generated at',
    totalRecords: 'Total records',
    no: 'No',
    card: 'Card',
    date: 'Date',
    status: 'Status',
    plate: 'Plate',
    customer: 'Customer',
    type: 'Type',
    disclaimerTitle: 'Disclaimer',
    disclaimerText: 'This report is system-generated for operational use only. Verify key values against source records before external sharing.',
  },
  es: {
    title: 'Reporte de Órdenes de Trabajo',
    generatedAt: 'Generado el',
    totalRecords: 'Total de registros',
    no: 'N°',
    card: 'Tarjeta',
    date: 'Fecha',
    status: 'Estado',
    plate: 'Matrícula',
    customer: 'Cliente',
    type: 'Tipo',
    disclaimerTitle: 'Descargo de responsabilidad',
    disclaimerText: 'Este reporte es generado por el sistema para uso operativo. Verifique los datos clave con los registros fuente antes de compartirlo externamente.',
  },
};

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function text(x: number, y: number, size: number, content: string): string {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(content)}) Tj ET`;
}

function buildStyledPdf(rows: ReportRow[], from: string | undefined, to: string | undefined, language: SupportedLanguage): string {
  const l = LABELS[language];
  const now = new Date();
  const generatedAt = `${l.generatedAt}: ${now.toLocaleString(language)}`;
  const dateRange = from || to ? ` (${from || '-'} - ${to || '-'})` : '';

  const commands: string[] = [];

  // Header background
  commands.push('0.95 0.72 0.16 rg');
  commands.push('30 760 535 60 re f');

  // Logo badge
  commands.push('0.20 0.20 0.20 rg');
  commands.push('40 775 34 34 re f');
  commands.push('1 1 1 rg');
  commands.push(text(48, 789, 14, 'W'));

  // Brand + title
  commands.push('0.18 0.18 0.18 rg');
  commands.push(text(86, 801, 12, 'Workshop Management'));
  commands.push(text(86, 783, 16, `${l.title}${dateRange}`));

  // Meta
  commands.push(text(40, 745, 10, generatedAt));
  commands.push(text(40, 730, 10, `${l.totalRecords}: ${rows.length}`));

  // Table header row
  const startY = 700;
  commands.push('0.20 0.20 0.20 rg');
  commands.push('40 682 515 18 re f');
  commands.push('1 1 1 rg');
  commands.push(text(45, 688, 9, l.no));
  commands.push(text(70, 688, 9, l.card));
  commands.push(text(125, 688, 9, l.date));
  commands.push(text(185, 688, 9, l.status));
  commands.push(text(265, 688, 9, l.plate));
  commands.push(text(330, 688, 9, l.customer));
  commands.push(text(470, 688, 9, l.type));

  // Table rows
  const visibleRows = rows.slice(0, 24);
  visibleRows.forEach((item, idx) => {
    const rowY = startY - idx * 22;

    if (idx % 2 === 0) {
      commands.push('0.97 0.97 0.97 rg');
      commands.push(`40 ${rowY - 16} 515 20 re f`);
    }

    commands.push('0.15 0.15 0.15 rg');
    const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString(language) : '-';
    const cardNo = item.jobCardId?.slice(-8) || '-';
    const status = item.status || '-';
    const plate = item.vehiclePlate || '-';
    const customer = item.customerName || '-';
    const type = item.customerType || '-';

    commands.push(text(45, rowY - 3, 9, `${idx + 1}`));
    commands.push(text(70, rowY - 3, 9, cardNo));
    commands.push(text(125, rowY - 3, 9, createdDate));
    commands.push(text(185, rowY - 3, 9, status.slice(0, 14)));
    commands.push(text(265, rowY - 3, 9, plate.slice(0, 12)));
    commands.push(text(330, rowY - 3, 9, customer.slice(0, 26)));
    commands.push(text(470, rowY - 3, 9, type.slice(0, 12)));
  });

  // Disclaimer block
  commands.push('0.98 0.98 0.98 rg');
  commands.push('40 80 515 70 re f');
  commands.push('0.20 0.20 0.20 rg');
  commands.push(text(48, 132, 10, l.disclaimerTitle));
  commands.push(text(48, 116, 9, l.disclaimerText.slice(0, 108)));
  commands.push(text(48, 104, 9, l.disclaimerText.slice(108, 216)));

  const stream = commands.join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let content = '%PDF-1.4\n';
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(content.length);
    content += `${obj}\n`;
  }

  const xrefStart = content.length;
  content += `xref\n0 ${objects.length + 1}\n`;
  content += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    content += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  content += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return content;
}

export function downloadJobCardsPdf(rows: ReportRow[], from?: string, to?: string, language: SupportedLanguage = 'en'): void {
  const pdf = buildStyledPdf(rows, from, to, language);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `job-cards-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  anchor.click();

  URL.revokeObjectURL(url);
}
