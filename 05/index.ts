const inputFilePath = Bun.argv[2] == "i" ? "input.txt" : "example.txt";
const input = Bun.file(inputFilePath);
const content = await input.text();

const [rangesString, ingredientIdsString] = content.split(/\r?\n\r?\n/);

if (!rangesString || !ingredientIdsString) {
  throw new Error("Input File Split Error");
}
const ranges = rangesString.split(/\r?\n/).map((range) => {
  const [first, last] = range.split("-");
  if (!first || !last) throw new Error("Range Split Error");
  let rangeInt;
  try {
    rangeInt = {
      first: Number.parseInt(first),
      last: Number.parseInt(last),
    };
  } catch {
    throw new Error("Range Parse Error");
  }
  return rangeInt;
});
const ingredientIds = ingredientIdsString
  .split(/\r?\n/)
  .map((id) => Number.parseInt(id));

let freshIdCounter = 0;
for (let id of ingredientIds) {
  for (let range of ranges) {
    if (range.first <= id && id <= range.last) {
      freshIdCounter++;
      break;
    }
  }
}

console.log(`Fresh Ids: ${freshIdCounter}`);
