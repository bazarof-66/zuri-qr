export type DotType = 'square' | 'rounded' | 'dots' | 'extra-rounded';
export type CornerType = 'square' | 'extra-rounded' | 'dot';

export function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  cellSize: number,
  fg: string,
  bg: string,
  style: CornerType,
) {
  const size = cellSize * 7;
  const cx = startX + size / 2;
  const cy = startY + size / 2;

  ctx.fillStyle = fg;
  if (style === 'square') ctx.fillRect(startX, startY, size, size);
  else { ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill(); }

  ctx.fillStyle = bg;
  if (style === 'square') ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 5, cellSize * 5);
  else { ctx.beginPath(); ctx.arc(cx, cy, cellSize * 2.5, 0, Math.PI * 2); ctx.fill(); }

  ctx.fillStyle = fg;
  if (style === 'dot') {
    ctx.beginPath(); ctx.arc(cx, cy, cellSize * 1.2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(startX + cellSize * 2, startY + cellSize * 2, cellSize * 3, cellSize * 3);
  }
}

function getQRCellType(mod: { data: Uint8Array; size: number }, r: number, c: number): 'dark' | 'light' {
  const fpSize = 7;
  const count = mod.size;
  for (const [sr, sc] of [[0, 0], [0, count - fpSize], [count - fpSize, 0]]) {
    if (r >= sr && r < sr + fpSize && c >= sc && c < sc + fpSize) {
      const lr = r - sr, lc = c - sc;
      const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
      const isCore = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
      return (isBorder || isCore) ? 'dark' : 'light';
    }
  }
  return mod.data[r * count + c] === 1 ? 'dark' : 'light';
}

function isFinderOrigin(mod: { data: Uint8Array; size: number }, r: number, c: number): boolean {
  const count = mod.size;
  const fpSize = 7;
  return (
    (r === 0 && c === 0) ||
    (r === 0 && c === count - fpSize) ||
    (r === count - fpSize && c === 0)
  );
}

export function drawQRCanvas(
  canvas: HTMLCanvasElement,
  size: number,
  mod: { data: Uint8Array; size: number },
  fg: string,
  bg: string,
  dotType: DotType,
  cornerType: CornerType,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = size;
  canvas.height = size;

  const count = mod.size;
  const cell = size / count;
  const radius = cell * 0.3;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      const t = getQRCellType(mod, r, c);
      if (t === 'light') continue;
      if (isFinderOrigin(mod, r, c)) continue;

      const x = c * cell;
      const y = r * cell;
      ctx.fillStyle = fg;
      const cx = x + cell / 2;

      switch (dotType) {
        case 'square':
          ctx.fillRect(x, y, cell, cell);
          break;
        case 'rounded':
          drawRoundedRect(ctx, x, y, cell, radius);
          break;
        case 'dots':
          ctx.beginPath();
          ctx.arc(cx, y + cell / 2, cell * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'extra-rounded':
          drawRoundedRect(ctx, x + cell * 0.05, y + cell * 0.05, cell * 0.9, cell * 0.3);
          break;
      }
    }
  }

  // Overlay finder patterns
  const origins = [[0, 0], [0, count - 7], [count - 7, 0]];
  for (const [or, oc] of origins) {
    const x = oc * cell;
    const y = or * cell;
    drawFinderPattern(ctx, x, y, cell, fg, bg, cornerType);
  }
}
