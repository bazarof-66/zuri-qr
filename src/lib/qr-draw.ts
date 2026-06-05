export type DotType = 'square' | 'rounded' | 'dots' | 'extra-rounded';
export type CornerType = 'square' | 'extra-rounded' | 'dot';

function isInFinder(r: number, c: number, size: number): boolean {
  const s = 7;
  return (
    (r < s && c < s) ||
    (r < s && c >= size - s) ||
    (r >= size - s && c < s)
  );
}

function isFinderDark(r: number, c: number, size: number): boolean {
  // finder region local coordinates
  let lr = r, lc = c;
  if (r >= size - 7) lr = r - (size - 7);
  if (c >= size - 7) lc = c - (size - 7);
  const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
  const isCore = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
  return isBorder || isCore;
}

function isFinderOrigin(r: number, c: number, size: number): boolean {
  return (
    (r === 0 && c === 0) ||
    (r === 0 && c === size - 7) ||
    (r === size - 7 && c === 0)
  );
}

function drawRoundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + s - r, y);
  ctx.quadraticCurveTo(x + s, y, x + s, y + r);
  ctx.lineTo(x + s, y + s - r);
  ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
  ctx.lineTo(x + r, y + s);
  ctx.quadraticCurveTo(x, y + s, x, y + s - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawFinder(ctx: CanvasRenderingContext2D, x: number, y: number, c: number, fg: string, bg: string, style: CornerType) {
  const s = c * 7;
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Outer 7x7 dark border
  ctx.fillStyle = fg;
  if (style === 'square') ctx.fillRect(x, y, s, s);
  else { ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, Math.PI * 2); ctx.fill(); }

  // Inner 5x5 light ring (carve out)
  ctx.fillStyle = bg;
  if (style === 'square') ctx.fillRect(x + c, y + c, c * 5, c * 5);
  else { ctx.beginPath(); ctx.arc(cx, cy, c * 2.5, 0, Math.PI * 2); ctx.fill(); }

  // Core 3x3 dark center
  ctx.fillStyle = fg;
  if (style === 'dot') {
    ctx.beginPath(); ctx.arc(cx, cy, c * 1.2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(x + c * 2, y + c * 2, c * 3, c * 3);
  }
}

export function drawQRCanvas(
  canvas: HTMLCanvasElement,
  canvasSize: number,
  mod: { data: Uint8Array; size: number },
  fg: string,
  bg: string,
  dotType: DotType,
  cornerType: CornerType,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const count = mod.size;
  const cell = canvasSize / count;
  const r = cell * 0.3;

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = fg;

  // Draw individual modules (skip finder regions entirely)
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (mod.data[row * count + col] !== 1) continue;
      if (isInFinder(row, col, count)) continue;

      const x = col * cell;
      const y = row * cell;
      const cx = x + cell / 2;

      switch (dotType) {
        case 'square':
          ctx.fillRect(x, y, cell, cell);
          break;
        case 'rounded':
          drawRoundedPath(ctx, x, y, cell, r);
          break;
        case 'dots':
          ctx.beginPath();
          ctx.arc(cx, y + cell / 2, cell * 0.35, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'extra-rounded':
          drawRoundedPath(ctx, x + cell * 0.05, y + cell * 0.05, cell * 0.9, cell * 0.25);
          break;
      }
    }
  }

  // Draw finder patterns on top (overwrites anything in those regions)
  const origins = [[0, 0], [0, count - 7], [count - 7, 0]];
  for (const [orow, ocol] of origins) {
    drawFinder(ctx, ocol * cell, orow * cell, cell, fg, bg, cornerType);
  }
}
