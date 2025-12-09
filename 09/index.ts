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
const lines = content.split(/\r?\n/);

const cornerPositions = lines.map((line) => {
  const [x, y] = line.split(",");
  try {
    return {
      x: parseInt(x!),
      y: parseInt(y!),
    };
  } catch (error) {
    throw new Error(`Parse Error, on Corner Position: ${error}`);
  }
});

let biggestArea = 0;
for (let aIndex = 0; aIndex < cornerPositions.length; aIndex++) {
  const aPosition = cornerPositions[aIndex];
  if (aPosition === undefined) {
    throw new Error("A Position Index Error");
  }
  for (let bIndex = aIndex + 1; bIndex < cornerPositions.length; bIndex++) {
    const bPosition = cornerPositions[bIndex];
    if (bPosition === undefined) {
      throw new Error("B Position Index Error");
    }
    const area =
      (Math.abs(aPosition.x - bPosition.x) + 1) *
      (Math.abs(aPosition.y - bPosition.y) + 1);

    // debug({ aPosition, bPosition, area });

    biggestArea = Math.max(biggestArea, area);
  }
}
print({ biggestArea });
