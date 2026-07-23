import type { DrawAttachmentMeta } from '@/types/budget-draw';

const PREVIEWABLE_EXT = /\.(pdf|png|jpe?g|gif|webp|bmp)$/i;

export function canPreviewAttachment(file: DrawAttachmentMeta) {
  return PREVIEWABLE_EXT.test(file.name);
}

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/** 预览地址；mock 附件无 url 时生成演示内容 */
export function getAttachmentPreviewUrl(file: DrawAttachmentMeta) {
  if (file.url) return file.url;
  if (isPdfAttachment(file.name)) return createDemoPdfUrl(file.name);
  if (isImageAttachment(file.name)) return createDemoImageUrl(file.name);
  return createDemoTextUrl(file.name);
}

/** mock 预览地址为 blob，关闭预览后需 revoke */
export function shouldRevokePreviewUrl(file: DrawAttachmentMeta) {
  return !file.url && isPdfAttachment(file.name);
}

export function downloadAttachment(file: DrawAttachmentMeta) {
  const url = getAttachmentPreviewUrl(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  if (!file.url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function createDemoPdfUrl(name: string) {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 68>>stream
BT /F1 16 Tf 72 720 Td (Demo: ${escapePdfText(name)}) Tj ET
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
0000000336 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
403
%%EOF`;
  const blob = new Blob([content], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

function escapePdfText(text: string) {
  return text.replace(/[\\()]/g, '\\$&').slice(0, 80);
}

function createDemoImageUrl(name: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createDemoTextUrl(name);

  ctx.fillStyle = '#f5f7fb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d9e2f3';
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = '#134bea';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('演示附件预览', 32, 56);
  ctx.fillStyle = '#595959';
  ctx.font = '14px sans-serif';
  wrapText(ctx, name, 32, 92, canvas.width - 64, 22);
  ctx.fillStyle = '#8c8c8c';
  ctx.font = '13px sans-serif';
  ctx.fillText('当前为 mock 环境，展示占位图片内容。', 32, canvas.height - 40);

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  let line = '';
  let offsetY = y;
  for (const char of text) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, offsetY);
      line = char;
      offsetY += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, offsetY);
}

function createDemoTextUrl(name: string) {
  const content = `演示附件：${name}\n\n当前为 mock 环境，附件内容为占位文本。`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export function isImageAttachment(name: string) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(name);
}

export function isPdfAttachment(name: string) {
  return /\.pdf$/i.test(name);
}
