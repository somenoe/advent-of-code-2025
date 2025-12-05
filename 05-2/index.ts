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

const mergedRanges = Array<(typeof ranges)[0]>();

for (let range of ranges.toSorted((a, b) => a.first - b.first)) {
  debug(range);
  if (mergedRanges.length === 0) {
    mergedRanges.push(range);
    continue;
  }
  const lastMergeRange = mergedRanges.at(mergedRanges.length - 1);
  if (!lastMergeRange) throw new Error("Last Merge Range Index Error");

  if (lastMergeRange.last < range.first) {
    mergedRanges.push(range);
    continue;
  }
  if (range.last > lastMergeRange.last) {
    lastMergeRange.last = range.last;
  }
}

debug("---------");
debug(mergedRanges);

let freshIdsCounter = 0;

for (const range of mergedRanges) {
  freshIdsCounter += range.last - range.first + 1;
}
print("Fresh Ids:", freshIdsCounter);

// Confession: I did use AI for first version, and this one is the rewritten version after using AI, Shame on me T_T
