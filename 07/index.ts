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
const lines = content.split(/\r?\n/).map((line) => line.split(""));

let splitCounter = 0;

// for second row - second last row
for (let row = 0 + 1; row < lines.length - 1; row++) {
  const aboveLine = lines[row - 1];
  const currentLine = lines[row];

  if (lines[row] === undefined) throw new Error("Above Line Index");
  if (aboveLine === undefined) throw new Error("Above Line Index");
  if (currentLine === undefined) throw new Error("Current Line Index");

  for (let column = 0; column < currentLine.length; column++) {
    const aboveChar = aboveLine[column];
    const currentChar = currentLine[column];
    if (aboveChar === undefined) throw new Error("Above Character Index");
    if (currentChar === undefined) throw new Error("Current Character Index");

    if (currentChar === "^" && aboveChar === "|") {
      lines[row]![column - 1] = "|";
      lines[row]![column + 1] = "|";
      splitCounter++;
    }
    if (currentChar === "." && (aboveChar === "S" || aboveChar === "|")) {
      lines[row]![column] = "|";
    }
  }

  debug("#", row + 1);
  debug(lines.map((line) => line.join("")).join("\n"));
  debug();
}
print({ splitCounter });
