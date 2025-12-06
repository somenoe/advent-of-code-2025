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

const symbols = lines.at(-1)?.split(/\s+/);
if (symbols === undefined) throw new Error("Empty Symbols Error");

let numberLineStringArray = lines.slice(0, -1);

let expectNumberLineLength = numberLineStringArray.reduce(
  (previous, current) => Math.max(previous, current.length),
  0
);

const numbersLines = numberLineStringArray.map((line) =>
  line.padEnd(expectNumberLineLength, " ")
);

// BUG: last element missing
const numberStrings = numbersLines.reduce((previous, current) => {
  for (let index = 0; index < current.length; index++) {
    if (previous[index] == undefined) {
      previous[index] = "";
    }
    const element = current[index];
    if (element === undefined) {
      throw new Error("Undefined Number String Adding Error");
    }
    previous[index] += element;
  }
  return previous;
}, new Array<string>());

const numbers = numberStrings.reduce((previous, current) => {
  // first time
  if (previous.length === 0) {
    previous.push([]);
  }

  const isAllSpace = current.trim() === "";
  if (isAllSpace) {
    previous.push([]);
    return previous;
  }

  let previousLastRow = previous.at(-1);
  if (previousLastRow === undefined) {
    throw new Error("previousLastRow: undefined");
  }
  try {
    previousLastRow.push(parseInt(current));
  } catch (error) {
    throw new Error(`Number Line Parse Error: ${error}`);
  }

  return previous;
}, new Array<number[]>());

debug("numbersLines:");
numbersLines.forEach((line) =>
  debug(line.length, line.substring(line.length - 20, line.length))
);

debug("variable:", {
  expectNumberLineLength,
  number: numbers.slice(-5, -1),
  // symbols: symbols.slice(-5, -1),
  numberStrings: numberStrings.slice(-5, -1),
  // symbols
});
debug(symbols.length, numbers.length);

let total = 0;

for (let symbolIndex = 0; symbolIndex < symbols.length; symbolIndex++) {
  const symbol = symbols[symbolIndex];
  if (symbol === undefined) throw new Error("Symbol Index Error");

  const numberRow = numbers[symbolIndex];
  if (numberRow === undefined) {
    debug({ numberRow, symbol, column: symbolIndex });
    throw new Error("Number Row Index Error");
  }

  let subTotal = symbol === "*" ? 1 : 0;
  for (let numberIndex = 0; numberIndex < numberRow.length; numberIndex++) {
    const number = numberRow[numberIndex];
    if (number === undefined) {
      throw new Error("Number column Index Error");
    }

    switch (symbol) {
      case "*":
        subTotal *= number;
        break;
      case "+":
        subTotal += number;
        break;
      default:
        debug({ symbol });
        throw new Error(`Symbol is not '*' or '+'`);
    }
  }

  total += subTotal;
  // debug("");
}

print("----------");
print("Total:", total);

/**
 * Take me HOURs to figure out that I accidenly add space ` ` to the end of input.txt file T_T
 */
