const DEBUG = true;
function print(...param: any) {
  if (DEBUG) console.log(...param);
}

const inputFilePath = Bun.argv[2] == "i" ? "input.txt" : "example.txt";
const input = Bun.file(inputFilePath);
const content = await input.text();

const [rangesString] = content.split(/\r?\n\r?\n/);

if (!rangesString) {
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
