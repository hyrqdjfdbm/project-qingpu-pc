import type { AssessmentDocument } from '@/types/assessment-score';

export function formatAssessmentFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function createDemoPdfUrl(fileName: string, periodLabel: string) {
  const label = escapePdfText(`${periodLabel} ${fileName}`);
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 88>>stream
BT /F1 14 Tf 72 720 Td (Assessment: ${label}) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000220 00000 n
0000000356 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
423
%%EOF`;
  return URL.createObjectURL(new Blob([content], { type: 'application/pdf' }));
}

function escapePdfText(text: string) {
  return text.replace(/[\\()]/g, '\\$&').slice(0, 80);
}

export function downloadAssessmentDoc(doc: AssessmentDocument) {
  const url = createDemoPdfUrl(doc.fileName, doc.periodLabel);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = doc.fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
