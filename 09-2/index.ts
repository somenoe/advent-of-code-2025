const DEBUG = true;

const print = (...param: any): void => console.log(...param);
const debug = (...param: any): void => DEBUG && print(...param);

const getInputPath = (arg: string): string =>
  arg === "i" ? "input.txt" : "example.txt";

const parseLines = (content: string): string[] =>
  content.split(/\r?\n/).filter((l) => l.trim() !== "");

const parseTile = (line: string): { x: number; y: number } => {
  const [x, y] = line.split(",").map(Number);
  return { x: x!, y: y! };
};

const main = async (): Promise<void> => {
  const inputFilePath = getInputPath(Bun.argv[2] ?? "e");
  const input = Bun.file(inputFilePath);
  const content = await input.text();
  const lines = parseLines(content);

  debug(`Loading ${inputFilePath}, ${lines.length} red tiles`);

  const redTiles: { x: number; y: number }[] = lines.map(parseTile);

  debug(`Parsed ${redTiles.length} red tiles`);

  type Edge = {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    isHorizontal: boolean;
  };

  const buildEdge = (
    curr: { x: number; y: number },
    next: { x: number; y: number }
  ): Edge => ({
    p1: curr,
    p2: next,
    isHorizontal: curr.y === next.y,
  });

  const getEdgeBounds = (edge: Edge) => ({
    minX: Math.min(edge.p1.x, edge.p2.x),
    maxX: Math.max(edge.p1.x, edge.p2.x),
    minY: Math.min(edge.p1.y, edge.p2.y),
    maxY: Math.max(edge.p1.y, edge.p2.y),
  });

  const edges: Edge[] = redTiles.map((curr, i) =>
    buildEdge(curr, redTiles[(i + 1) % redTiles.length]!)
  );

  debug(`Built ${edges.length} edges`);

  const isOnEdge = (px: number, py: number): boolean =>
    edges.some((edge) => {
      if (edge.isHorizontal && py === edge.p1.y) {
        const { minX, maxX } = getEdgeBounds(edge);
        return px >= minX && px <= maxX;
      } else if (!edge.isHorizontal && px === edge.p1.x) {
        const { minY, maxY } = getEdgeBounds(edge);
        return py >= minY && py <= maxY;
      }
      return false;
    });

  const isStrictlyInsidePolygon = (px: number, py: number): boolean =>
    edges.reduce((inside, edge) => {
      const { x: x1, y: y1 } = edge.p1;
      const { x: x2, y: y2 } = edge.p2;
      if (y1 > py !== y2 > py) {
        const xIntersect = x1 + ((py - y1) / (y2 - y1)) * (x2 - x1);
        return px < xIntersect ? !inside : inside;
      }
      return inside;
    }, false);

  const insideCache = new Map<string, boolean>();
  const cacheKey = (x: number, y: number): string => `${x},${y}`;

  const isInsideOrOnPolygon = (px: number, py: number): boolean => {
    const k = cacheKey(px, py);
    if (insideCache.has(k)) return insideCache.get(k)!;
    const result = isOnEdge(px, py) || isStrictlyInsidePolygon(px, py);
    insideCache.set(k, result);
    return result;
  };

  const checkCornersValid = (
    left: number,
    top: number,
    right: number,
    bottom: number
  ): boolean =>
    [
      isInsideOrOnPolygon(left, top),
      isInsideOrOnPolygon(right, top),
      isInsideOrOnPolygon(left, bottom),
      isInsideOrOnPolygon(right, bottom),
    ].every(Boolean);

  const checkEdge = (
    edge: Edge,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): boolean => {
    const { minX, maxX, minY, maxY } = getEdgeBounds(edge);
    if (edge.isHorizontal) {
      const edgeY = edge.p1.y;
      if (edgeY <= top || edgeY >= bottom) return true;
      if (maxX <= left || minX >= right) return true;
      const checks: boolean[] = [
        isInsideOrOnPolygon(left, edgeY),
        isInsideOrOnPolygon(right, edgeY),
      ];
      if (edgeY - 1 > top) {
        checks.push(
          isInsideOrOnPolygon(left, edgeY - 1),
          isInsideOrOnPolygon(right, edgeY - 1)
        );
      }
      if (edgeY + 1 < bottom) {
        checks.push(
          isInsideOrOnPolygon(left, edgeY + 1),
          isInsideOrOnPolygon(right, edgeY + 1)
        );
      }
      const midX = Math.floor(
        (Math.max(left, minX) + Math.min(right, maxX)) / 2
      );
      if (midX > left && midX < right) {
        if (edgeY - 1 > top) checks.push(isInsideOrOnPolygon(midX, edgeY - 1));
        if (edgeY + 1 < bottom)
          checks.push(isInsideOrOnPolygon(midX, edgeY + 1));
      }
      return checks.every(Boolean);
    } else {
      const edgeX = edge.p1.x;
      if (edgeX <= left || edgeX >= right) return true;
      if (maxY <= top || minY >= bottom) return true;
      const checks: boolean[] = [
        isInsideOrOnPolygon(edgeX, top),
        isInsideOrOnPolygon(edgeX, bottom),
      ];
      if (edgeX - 1 > left) {
        checks.push(
          isInsideOrOnPolygon(edgeX - 1, top),
          isInsideOrOnPolygon(edgeX - 1, bottom)
        );
      }
      if (edgeX + 1 < right) {
        checks.push(
          isInsideOrOnPolygon(edgeX + 1, top),
          isInsideOrOnPolygon(edgeX + 1, bottom)
        );
      }
      const midY = Math.floor(
        (Math.max(top, minY) + Math.min(bottom, maxY)) / 2
      );
      if (midY > top && midY < bottom) {
        if (edgeX - 1 > left) checks.push(isInsideOrOnPolygon(edgeX - 1, midY));
        if (edgeX + 1 < right)
          checks.push(isInsideOrOnPolygon(edgeX + 1, midY));
      }
      return checks.every(Boolean);
    }
  };

  const isRectangleValid = (
    left: number,
    top: number,
    right: number,
    bottom: number
  ): boolean =>
    checkCornersValid(left, top, right, bottom) &&
    edges.every((edge) => checkEdge(edge, left, top, right, bottom));

  const generatePairs = (): { i: number; j: number; area: number }[] => {
    const pairs: { i: number; j: number; area: number }[] = [];
    for (let i = 0; i < redTiles.length; i++) {
      const a = redTiles[i]!;
      for (let j = i + 1; j < redTiles.length; j++) {
        const b = redTiles[j]!;
        if (a.x !== b.x && a.y !== b.y) {
          const width = Math.abs(a.x - b.x) + 1;
          const height = Math.abs(a.y - b.y) + 1;
          pairs.push({ i, j, area: width * height });
        }
      }
    }
    return pairs.sort((a, b) => b.area - a.area);
  };

  const pairs = generatePairs();

  debug(`Checking ${pairs.length} rectangle pairs (sorted by area desc)...`);

  let biggestArea = 0;
  for (let index = 0; index < pairs.length; index++) {
    if (pairs[index]!.area <= biggestArea) {
      break;
    }

    const pair = pairs[index]!;

    const a = redTiles[pair.i]!;
    const b = redTiles[pair.j]!;

    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);

    if (isRectangleValid(left, top, right, bottom)) {
      debug(
        `Found valid rectangle: (${a.x},${a.y}) to (${b.x},${b.y}), area=${pair.area}`
      );
      biggestArea = pair.area;
    }
  }
  print({ biggestArea });
};

main();
