const DEBUG = false;

function print(...param: any) {
  console.log(...param);
}
function debug(...param: any) {
  if (DEBUG) print(...param);
}

const inputFilePath = Bun.argv[2] == "i" ? "input.txt" : "example.txt";
const input = Bun.file(inputFilePath);

const content = await input.text();
const lines = content.split(/\r?\n/).filter((line) => line.trim());

interface Position {
  x: number;
  y: number;
  z: number;
}
const boxPositions: Position[] = lines.map((line) => {
  let [xString, yString, zString] = line.split(",");
  let x, y, z;
  try {
    x = parseInt(xString!);
    y = parseInt(yString!);
    z = parseInt(zString!);
  } catch (error) {
    throw new Error(`Position Parse Error: ${error}`);
  }
  return {
    x,
    y,
    z,
  };
});

const calculateDistance = (a: Position, b: Position) =>
  Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );

interface Distance {
  aIndex: number;
  bIndex: number;
  distance: number;
}
const distances = new Array<Distance>();

for (let aIndex = 0; aIndex < boxPositions.length; aIndex++) {
  for (let bIndex = aIndex + 1; bIndex < boxPositions.length; bIndex++) {
    const aPosition = boxPositions[aIndex];
    const bPosition = boxPositions[bIndex];

    if (aPosition === undefined || bPosition === undefined) {
      throw new Error("Position Index Error");
    }

    const distance = calculateDistance(aPosition, bPosition);
    distances.push({
      aIndex,
      bIndex,
      distance,
    });
  }
}

distances.sort((a, b) => a.distance - b.distance);

// Union-Find functional implementation
const parent = Array.from({ length: boxPositions.length }, (_, i) => i);
const rank = Array(boxPositions.length).fill(0);

const find = (x: number): number => {
  if (parent[x] === undefined) {
    throw new Error(`Parent index ${x} is undefined`);
  }
  if (parent[x] !== x) {
    const found = find(parent[x]);
    if (found === undefined) {
      throw new Error(`Find returned undefined for parent[${x}]`);
    }
    parent[x] = found; // Path compression
  }
  const result = parent[x];
  if (result === undefined) {
    throw new Error(`Parent[${x}] is undefined after find`);
  }
  return result;
};

const union = (x: number, y: number): boolean => {
  const rootX = find(x);
  const rootY = find(y);

  if (rootX === rootY) return false; // Already in same set

  // Union by rank
  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY;
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX;
  } else {
    parent[rootY] = rootX;
    rank[rootX]++;
  }
  return true; // Successful union
};

const countComponents = (): number => {
  const roots = new Set<number>();
  for (let i = 0; i < parent.length; i++) {
    roots.add(find(i));
  }
  return roots.size;
};

// Part 2: Connect until all boxes are in one circuit
let lastAIndex = 0;
let lastBIndex = 0;

for (const { aIndex, bIndex } of distances) {
  if (union(aIndex, bIndex)) {
    lastAIndex = aIndex;
    lastBIndex = bIndex;
    if (countComponents() === 1) {
      break;
    }
  }
}

const posA = boxPositions[lastAIndex];
const posB = boxPositions[lastBIndex];

if (posA === undefined) {
  throw new Error(`Box position at index ${lastAIndex} is undefined`);
}
if (posB === undefined) {
  throw new Error(`Box position at index ${lastBIndex} is undefined`);
}

const answer = posA.x * posB.x;

print(`Answer: ${answer}`);
