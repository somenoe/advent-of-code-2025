import * as fs from "fs";

function parseInput(content: string): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const line of content.split("\n")) {
    if (line.trim().length === 0) continue;

    const parts = line.split(":");
    if (parts.length !== 2) continue;

    const device = parts[0]!.trim();
    const outputs = parts[1]!
      .trim()
      .split(/\s+/)
      .filter((s) => s.length > 0);

    graph.set(device, outputs);
  }

  return graph;
}

// Compute which nodes can reach a target using reverse BFS
function computeReachable(
  graph: Map<string, string[]>,
  target: string
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [target];
  reachable.add(target);

  // Build reverse graph
  const reverseGraph = new Map<string, string[]>();
  for (const [node, neighbors] of graph) {
    for (const neighbor of neighbors) {
      if (!reverseGraph.has(neighbor)) {
        reverseGraph.set(neighbor, []);
      }
      reverseGraph.get(neighbor)!.push(node);
    }
  }

  let idx = 0;
  while (idx < queue.length) {
    const current = queue[idx++]!;
    const predecessors = reverseGraph.get(current);
    if (predecessors) {
      for (const pred of predecessors) {
        if (!reachable.has(pred)) {
          reachable.add(pred);
          queue.push(pred);
        }
      }
    }
  }

  return reachable;
}

function countPaths(
  graph: Map<string, string[]>,
  current: string,
  target: string,
  visited: Set<string>,
  reachable: Set<string>
): number {
  if (current === target) {
    return 1;
  }

  visited.add(current);

  let totalPaths = 0;

  const neighbors = graph.get(current);
  if (neighbors) {
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && reachable.has(neighbor)) {
        totalPaths += countPaths(graph, neighbor, target, visited, reachable);
      }
    }
  }

  visited.delete(current);

  return totalPaths;
}

function countPathsWithRequired(
  graph: Map<string, string[]>,
  current: string,
  target: string,
  required: string[],
  visited: Set<string>,
  foundRequired: Set<string>,
  reachableTarget: Set<string>,
  reachableReq: Set<string>[],
  memo: Map<string, number>,
  callCount: { count: number }
): number {
  callCount.count++;
  if (callCount.count % 100000 === 0) {
    console.log(`  Processed ${callCount.count} nodes...`);
  }

  // Check if current node is one of the required nodes
  const isRequired = required.includes(current);
  if (isRequired) {
    foundRequired.add(current);
  }

  // If we reached the target, check if we visited all required nodes
  if (current === target) {
    const allFound = required.every((req) => foundRequired.has(req));
    if (isRequired) {
      foundRequired.delete(current);
    }
    return allFound ? 1 : 0;
  }

  // Pruning: check if we can still reach target
  if (!reachableTarget.has(current)) {
    if (isRequired) {
      foundRequired.delete(current);
    }
    return 0;
  }

  // Pruning: check if we can reach all missing required nodes
  for (let i = 0; i < required.length; i++) {
    const req = required[i]!;
    const reqReach = reachableReq[i]!;
    if (!foundRequired.has(req) && !reqReach.has(current)) {
      if (isRequired) {
        foundRequired.delete(current);
      }
      return 0;
    }
  }

  // Create a bitmask for foundRequired state
  let stateMask = 0;
  for (let i = 0; i < required.length; i++) {
    const req = required[i]!;
    if (foundRequired.has(req)) {
      stateMask |= 1 << i;
    }
  }

  const memoKey = `${current}:${stateMask}`;
  if (memo.has(memoKey)) {
    if (isRequired) {
      foundRequired.delete(current);
    }
    return memo.get(memoKey)!;
  }

  visited.add(current);

  let totalPaths = 0;

  const neighbors = graph.get(current);
  if (neighbors) {
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        totalPaths += countPathsWithRequired(
          graph,
          neighbor,
          target,
          required,
          visited,
          foundRequired,
          reachableTarget,
          reachableReq,
          memo,
          callCount
        );
      }
    }
  }

  visited.delete(current);

  if (isRequired) {
    foundRequired.delete(current);
  }

  memo.set(memoKey, totalPaths);

  return totalPaths;
}

function solve(content: string): number {
  const graph = parseInput(content);
  const reachable = computeReachable(graph, "out");
  const visited = new Set<string>();
  return countPaths(graph, "you", "out", visited, reachable);
}

function solvePart2(content: string): number {
  const graph = parseInput(content);

  console.log("Calculating Part 2... (analyzing graph)");

  const reachableTarget = computeReachable(graph, "out");
  const reachableDac = computeReachable(graph, "dac");
  const reachableFft = computeReachable(graph, "fft");
  const reachableReq = [reachableDac, reachableFft];

  // Quick check: if svr can't reach required nodes or target, return 0
  if (!reachableTarget.has("svr")) {
    console.log("SVR cannot reach OUT");
    return 0;
  }
  if (!reachableDac.has("svr")) {
    console.log("SVR cannot reach dac");
    return 0;
  }
  if (!reachableFft.has("svr")) {
    console.log("SVR cannot reach fft");
    return 0;
  }

  console.log("Graph analysis complete. Searching paths...");

  const visited = new Set<string>();
  const required = ["dac", "fft"];
  const foundRequired = new Set<string>();
  const memo = new Map<string, number>();
  const callCount = { count: 0 };

  return countPathsWithRequired(
    graph,
    "svr",
    "out",
    required,
    visited,
    foundRequired,
    reachableTarget,
    reachableReq,
    memo,
    callCount
  );
}

function readFile(path: string): string {
  return fs.readFileSync(path, "utf-8");
}

async function main() {
  console.log("=== Part 1 ===");

  // Run example.txt first
  console.log("Running example.txt...");
  const exampleContent = readFile("example.txt");
  const exampleResult = solve(exampleContent);
  console.log("Example result:", exampleResult);

  // Check if example result matches expected (5)
  const EXPECTED_EXAMPLE = 5;
  if (exampleResult !== EXPECTED_EXAMPLE) {
    console.log(
      `ERROR: Example result ${exampleResult} does not match expected ${EXPECTED_EXAMPLE}. Stopping.`
    );
    return;
  }

  console.log("✓ Example result is correct!\n");

  // Run input.txt
  console.log("Running input.txt...");
  const inputContent = readFile("input.txt");
  const inputResult = solve(inputContent);
  console.log("Part 1 answer:", inputResult, "\n");

  console.log("=== Part 2 ===");

  // Run example2.txt first
  console.log("Running example2.txt...");
  const example2Content = readFile("example2.txt");
  const example2Result = solvePart2(example2Content);
  console.log("Example result:", example2Result);

  // Check if example result matches expected (2)
  const EXPECTED_EXAMPLE2 = 2;
  if (example2Result !== EXPECTED_EXAMPLE2) {
    console.log(
      `ERROR: Example result ${example2Result} does not match expected ${EXPECTED_EXAMPLE2}. Stopping.`
    );
    return;
  }

  console.log("✓ Example result is correct!\n");

  // Run input.txt for part 2
  console.log("Running input.txt...");
  const inputResult2 = solvePart2(inputContent);
  console.log("Part 2 answer:", inputResult2);
}

main();
