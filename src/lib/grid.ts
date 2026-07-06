export type GridCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface BBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function buildCells(container: BBox): BBox[] {
  const cells: BBox[] = [];
  const colW = container.width / 3;
  const rowH = container.height / 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        left: container.left + c * colW,
        top: container.top + r * rowH,
        width: colW,
        height: rowH,
      });
    }
  }
  return cells;
}

export function pointToCell(x: number, y: number, cells: BBox[]): GridCell {
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (
      x >= c.left &&
      x < c.left + c.width &&
      y >= c.top &&
      y < c.top + c.height
    ) {
      return (i + 1) as GridCell;
    }
  }
  return 0;
}

export function digitsToPosition(d1: GridCell, d2: GridCell): number {
  if (d1 === 0) d1 = 1;
  if (d2 === 0) d2 = 1;
  return d1 * 10 + d2;
}
