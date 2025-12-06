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
const lines = content.split(/\r?\n/).map((line) => line.trim().split(/\s+/));

const symbols = lines.at(-1);
if (symbols === undefined) throw new Error("Empty Symbols Error");
const numbers = lines
  .slice(0, -1)
  .map((line) => line.map((item) => parseInt(item)));

debug({ symbols });
debug({ numbers });

let total = 0;

for (let column = 0; column < symbols.length; column++) {
  const symbol = symbols[column];
  if (symbol === undefined) throw new Error("Symbol Index Error");

  let subTotal = symbol === "*" ? 1 : 0;

  for (let row = 0; row < numbers.length; row++) {
    const numberRow = numbers[row];
    if (numberRow === undefined) throw new Error("Number Row Index Error");
    const number = numberRow[column];
    if (number === undefined) throw new Error("Number column Index Error");

    switch (symbol) {
      case "*":
        subTotal *= number;
        break;
      case "+":
        subTotal += number;
        break;
      default:
        throw new Error("Symbol is not `*` or `+`");
    }
  }

  total += subTotal;
}

print("Total:", total);
