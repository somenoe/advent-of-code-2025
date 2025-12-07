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

const EMPTY_CELL = 0;
const SPLIT_CELL = -1;
const lines: number[][] = content.split(/\r?\n/).map((line) =>
  line.split("").map((char) => {
    switch (char) {
      case "S":
        return 1;
      case ".":
        return EMPTY_CELL;
      case "^":
        return SPLIT_CELL;
      default:
        throw new Error("Unexpected Character On Input");
    }
  })
);

// for second row - second last row
for (let row = 0 + 1; row < lines.length - 1; row++) {
  const aboveLine = lines[row - 1];
  const currentLine = lines[row];

  if (lines[row] === undefined) throw new Error("Above Line Index");
  if (aboveLine === undefined) throw new Error("Above Line Index");
  if (currentLine === undefined) throw new Error("Current Line Index");

  for (let column = 0; column < currentLine.length; column++) {
    const above = aboveLine[column];
    const current = currentLine[column];
    if (above === undefined) throw new Error("Above Character Index");
    if (current === undefined) throw new Error("Current Character Index");

    if (
      current === SPLIT_CELL &&
      above !== SPLIT_CELL &&
      above !== EMPTY_CELL
    ) {
      lines[row]![column - 1]! += above;

      lines[row]![column + 1]! += above;
    }
    if (current === EMPTY_CELL && above !== SPLIT_CELL) {
      lines[row]![column]! = above;
    }
    if (
      current !== SPLIT_CELL &&
      current !== EMPTY_CELL &&
      above !== EMPTY_CELL &&
      above !== SPLIT_CELL
    ) {
      lines[row]![column]! += above;
    }
  }

  debug("#", row + 1);
  debug(
    lines
      .map((line) =>
        line
          .map((number) => {
            let ch = number.toString();
            // let ch = "|";
            if (number === EMPTY_CELL) ch = ".";
            if (number === SPLIT_CELL) ch = "^";
            return ch.padStart(3);
          })
          .join("")
      )
      .join("\n")
  );
  debug();
}

const totalTimeline = lines.at(-2)?.reduce((previous, current) => {
  if (current !== SPLIT_CELL) {
    return previous + current;
  }
  return previous;
}, 0);
print({ totalTimeline });
