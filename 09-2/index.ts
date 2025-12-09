const DEBUG = true;

function print(...param: any) {
  console.log(...param);
}
function debug(...param: any) {
  if (DEBUG) print(...param);
}

const inputFilePath = Bun.argv[2] == "i" ? "input.txt" : "example.txt";
const input = Bun.file(inputFilePath);

const content = await input.text();
const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");

debug(`Loading ${inputFilePath}, ${lines.length} red tiles`);

// Parse red tile positions (polygon vertices)
const redTiles: { x: number; y: number }[] = lines.map((line) => {
  const [x, y] = line.split(",");
  return { x: parseInt(x!), y: parseInt(y!) };
});

debug(`Parsed ${redTiles.length} red tiles`);

// Build edges of the polygon (horizontal and vertical segments)
type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isHorizontal: boolean;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};
const edges: Edge[] = [];

for (let i = 0; i < redTiles.length; i++) {
  const curr = redTiles[i]!;
  const next = redTiles[(i + 1) % redTiles.length]!;
  const isHorizontal = curr.y === next.y;
  edges.push({
    x1: curr.x,
    y1: curr.y,
    x2: next.x,
    y2: next.y,
    isHorizontal,
    minX: Math.min(curr.x, next.x),
    maxX: Math.max(curr.x, next.x),
    minY: Math.min(curr.y, next.y),
    maxY: Math.max(curr.y, next.y),
  });
}

debug(`Built ${edges.length} edges`);

// Point-in-polygon using ray casting (cached)
const insideCache = new Map<string, boolean>();

function isOnEdge(px: number, py: number): boolean {
  for (const edge of edges) {
    if (edge.isHorizontal && py === edge.y1) {
      if (px >= edge.minX && px <= edge.maxX) return true;
    } else if (!edge.isHorizontal && px === edge.x1) {
      if (py >= edge.minY && py <= edge.maxY) return true;
    }
  }
  return false;
}

function isStrictlyInsidePolygon(px: number, py: number): boolean {
  let inside = false;
  for (const edge of edges) {
    const { x1, y1, x2, y2 } = edge;
    if (y1 > py !== y2 > py) {
      const xIntersect = x1 + ((py - y1) / (y2 - y1)) * (x2 - x1);
      if (px < xIntersect) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function isInsideOrOnPolygon(px: number, py: number): boolean {
  const k = `${px},${py}`;
  if (insideCache.has(k)) return insideCache.get(k)!;

  const result = isOnEdge(px, py) || isStrictlyInsidePolygon(px, py);
  insideCache.set(k, result);
  return result;
}

// Check if rectangle is fully inside polygon
// We need to check all 4 edges of the rectangle against all polygon edges
function isRectangleValid(
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean {
  // Check all 4 corners
  if (!isInsideOrOnPolygon(left, top)) return false;
  if (!isInsideOrOnPolygon(right, top)) return false;
  if (!isInsideOrOnPolygon(left, bottom)) return false;
  if (!isInsideOrOnPolygon(right, bottom)) return false;

  // For each polygon edge, check if it "cuts" through our rectangle
  // causing some parts to be outside
  for (const edge of edges) {
    if (edge.isHorizontal) {
      const edgeY = edge.y1;
      // Check if this horizontal edge is strictly inside the rectangle's Y range
      if (edgeY > top && edgeY < bottom) {
        // Check if edge overlaps with rectangle's X range
        if (edge.maxX > left && edge.minX < right) {
          // This edge cuts through - check points along the rectangle's left and right borders at this Y
          if (!isInsideOrOnPolygon(left, edgeY)) return false;
          if (!isInsideOrOnPolygon(right, edgeY)) return false;

          // Also check points just above and below the edge within the rectangle
          if (edgeY - 1 > top && !isInsideOrOnPolygon(left, edgeY - 1))
            return false;
          if (edgeY + 1 < bottom && !isInsideOrOnPolygon(left, edgeY + 1))
            return false;
          if (edgeY - 1 > top && !isInsideOrOnPolygon(right, edgeY - 1))
            return false;
          if (edgeY + 1 < bottom && !isInsideOrOnPolygon(right, edgeY + 1))
            return false;

          // Check midpoint
          const midX = Math.floor(
            (Math.max(left, edge.minX) + Math.min(right, edge.maxX)) / 2
          );
          if (midX > left && midX < right) {
            if (edgeY - 1 > top && !isInsideOrOnPolygon(midX, edgeY - 1))
              return false;
            if (edgeY + 1 < bottom && !isInsideOrOnPolygon(midX, edgeY + 1))
              return false;
          }
        }
      }
    } else {
      const edgeX = edge.x1;
      // Check if this vertical edge is strictly inside the rectangle's X range
      if (edgeX > left && edgeX < right) {
        // Check if edge overlaps with rectangle's Y range
        if (edge.maxY > top && edge.minY < bottom) {
          // This edge cuts through - check points along the rectangle's top and bottom borders at this X
          if (!isInsideOrOnPolygon(edgeX, top)) return false;
          if (!isInsideOrOnPolygon(edgeX, bottom)) return false;

          // Also check points just left and right of the edge within the rectangle
          if (edgeX - 1 > left && !isInsideOrOnPolygon(edgeX - 1, top))
            return false;
          if (edgeX + 1 < right && !isInsideOrOnPolygon(edgeX + 1, top))
            return false;
          if (edgeX - 1 > left && !isInsideOrOnPolygon(edgeX - 1, bottom))
            return false;
          if (edgeX + 1 < right && !isInsideOrOnPolygon(edgeX + 1, bottom))
            return false;

          // Check midpoint
          const midY = Math.floor(
            (Math.max(top, edge.minY) + Math.min(bottom, edge.maxY)) / 2
          );
          if (midY > top && midY < bottom) {
            if (edgeX - 1 > left && !isInsideOrOnPolygon(edgeX - 1, midY))
              return false;
            if (edgeX + 1 < right && !isInsideOrOnPolygon(edgeX + 1, midY))
              return false;
          }
        }
      }
    }
  }

  return true;
}

// Build pairs sorted by area descending
const pairs: { i: number; j: number; area: number }[] = [];
for (let i = 0; i < redTiles.length; i++) {
  const a = redTiles[i]!;
  for (let j = i + 1; j < redTiles.length; j++) {
    const b = redTiles[j]!;
    if (a.x === b.x || a.y === b.y) continue;
    const width = Math.abs(a.x - b.x) + 1;
    const height = Math.abs(a.y - b.y) + 1;
    pairs.push({ i, j, area: width * height });
  }
}
pairs.sort((a, b) => b.area - a.area);

debug(`Checking ${pairs.length} rectangle pairs (sorted by area desc)...`);

// Process pairs
let biggestArea = 0;
let bestRect: {
  a: { x: number; y: number };
  b: { x: number; y: number };
} | null = null;
let checked = 0;

for (const pair of pairs) {
  if (pair.area <= biggestArea) break;

  checked++;
  if (checked % 10000 === 0) {
    debug(`Checked ${checked}/${pairs.length}, best: ${biggestArea}`);
  }

  const a = redTiles[pair.i]!;
  const b = redTiles[pair.j]!;
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const bottom = Math.max(a.y, b.y);

  if (isRectangleValid(left, top, right, bottom)) {
    biggestArea = pair.area;
    bestRect = { a, b };
    debug(
      `Found valid rectangle: (${a.x},${a.y}) to (${b.x},${b.y}), area=${pair.area}`
    );
  }
}

print({ biggestArea });
if (bestRect) {
  debug(
    `Best rectangle corners: (${bestRect.a.x},${bestRect.a.y}) to (${bestRect.b.x},${bestRect.b.y})`
  );
}
