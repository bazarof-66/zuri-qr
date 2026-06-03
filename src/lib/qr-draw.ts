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

  ctx.fillStyle = bg;
  if (style === 'square') ctx.fillRect(startX, startY, size, size);
  else { ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill(); }

  ctx.fillStyle = fg;
  if (style === 'square') ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 5, cellSize * 5);
  else { ctx.beginPath(); ctx.arc(cx, cy, cellSize * 2.5, 0, Math.PI * 2); ctx.fill(); }

  if (style === 'dot') {
    ctx.beginPath(); ctx.arc(cx, cy, cellSize * 0.8, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(startX + cellSize * 2.5, startY + cellSize * 2.5, cellSize * 2, cellSize * 2);
  }
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
  const fpRegions = [
    { r1: 0, r2: 7, c1: 0, c2: 7 },
    { r1: 0, r2: 7, c1: count - 7, c2: count },
    { r1: count - 7, r2: count, c1: 0, c2: 7 },
  ];

  function isFinder(r: number, c: number) {
    return fpRegions.some(fp => r >= fp.r1 && r < fp.r2 && c >= fp.c1 && c < fp.c2);
  }

  function isFinderOrigin(r: number, c: number) {
    return fpRegions.some(fp => r === fp.r1 && c === fp.c1);
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (mod.data[r * count + c] !== 1) continue;
      const x = c * cell;
      const y = r * cell;

      if (isFinder(r, c)) {
        if (isFinderOrigin(r, c)) {
          drawFinderPattern(ctx, x, y, cell, fg, bg, cornerType);
        } else {
          ctx.fillRect(x, y, cell, cell);
        }
        continue;
      }

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

  if (cornerType !== 'square') {
    fpRegions.forEach(fp => {
      const x = fp.c1 * cell;
      const y = fp.r1 * cell;
      drawFinderPattern(ctx, x, y, cell, fg, bg, cornerType);
    });
  }
}
