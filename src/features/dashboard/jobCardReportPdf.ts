interface ReportRow {
  jobCardId?: string;
  createdAt?: Date;
  status?: string;
  customerName?: string;
  customerType?: string;
  vehiclePlate?: string;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdf(lines: string[]): string {
  const body = lines
    .map((line, idx) => `BT /F1 10 Tf 40 ${780 - idx * 14} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`,
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

export function downloadJobCardsPdf(rows: ReportRow[], from?: string, to?: string): void {
  const header = `Job Cards Report${from || to ? ` (${from || '-'} to ${to || '-'})` : ''}`;
  const timestamp = `Generated at: ${new Date().toLocaleString()}`;

  const tableLines = rows.slice(0, 45).map((item, index) => {
    const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-';
    const cardNo = item.jobCardId?.slice(-8) || '-';
    const plate = item.vehiclePlate || '-';
    const customer = item.customerName || '-';
    const type = item.customerType || '-';
    return `${index + 1}. ${cardNo} | ${createdDate} | ${item.status || '-'} | ${plate} | ${customer} | ${type}`;
  });

  const lines = [
    header,
    timestamp,
    `Total records: ${rows.length}`,
    '---',
    'No | Card | Date | Status | Plate | Customer | Type',
    ...tableLines,
  ];

  const pdf = buildSimplePdf(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `job-cards-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  anchor.click();

  URL.revokeObjectURL(url);
}
