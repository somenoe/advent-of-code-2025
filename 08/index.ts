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
  let line = `#${aIndex.toString().padStart(2)} -`;
  for (let bIndex = aIndex; bIndex < boxPositions.length; bIndex++) {
    const aPosition = boxPositions[aIndex];
    const bPosition = boxPositions[bIndex];

    if (aPosition === undefined || bPosition === undefined) {
      throw new Error("Position Index Error");
    }

    const distance = calculateDistance(aPosition, bPosition);

    if (distance > 0)
      distances.push({
        aIndex,
        bIndex,
        distance,
      });

    line += ` ${distance.toFixed(0).padStart(4, " ")}`;
  }
  // debug(line);
}

distances.sort((a, b) => a.distance - b.distance);

const connectedBoxes = new Set<number>();
const circuits = new Array<Set<number>>();

let connectionRemain = Bun.argv[2] == "i" ? 1_000 : 10;

for (let index = 0; index < distances.length; index++) {
  const distance = distances[index];
  if (distance === undefined) {
    throw new Error("Distance Index Error");
  }
  const { aIndex, bIndex } = distance;
  // debug(index, { aIndex, bIndex });

  const aIsConnected = connectedBoxes.has(aIndex);
  const bIsConnected = connectedBoxes.has(bIndex);

  if (aIsConnected && bIsConnected) {
    // debug("Both connected");
    let tempCircuit: Set<number> | null = null;

    for (const circuit of circuits) {
      if (circuit.has(aIndex) && circuit.has(bIndex)) {
        // debug("Same Circuit");
        break;
      }
      if (
        tempCircuit !== null &&
        (circuit.has(aIndex) || circuit.has(bIndex))
      ) {
        // debug("Found Second circuit, Merge both circuit");

        // Remove smaller circuit
        let toRemoveCircuitIndex =
          circuit.size < tempCircuit.size
            ? circuits.indexOf(circuit)
            : circuits.indexOf(tempCircuit);

        // Merge
        for (const box of tempCircuit) {
          circuit.add(box);
        }
        for (const box of circuit) {
          tempCircuit.add(box);
        }

        if (toRemoveCircuitIndex === null) {
          throw new Error("Temp Circuit Index is Null");
        }
        circuits.splice(toRemoveCircuitIndex, 1);
        break;
      }
      if (
        tempCircuit === null &&
        ((circuit.has(aIndex) && !circuit.has(bIndex)) ||
          (circuit.has(bIndex) && !circuit.has(aIndex)))
      ) {
        // debug("Found first circuit");
        tempCircuit = circuit;
      }
    }

    connectionRemain--;
  } else if (aIsConnected) {
    // debug("A connected");
    for (const circuit of circuits) {
      if (circuit.has(aIndex) && !circuit.has(bIndex)) {
        circuit.add(bIndex);
        connectedBoxes.add(bIndex);
        connectionRemain--;
        break;
      }
    }
  } else if (bIsConnected) {
    // debug("B connected");
    for (const circuit of circuits) {
      if (circuit.has(bIndex) && !circuit.has(aIndex)) {
        circuit.add(aIndex);
        connectedBoxes.add(aIndex);
        connectionRemain--;
        break;
      }
    }
  } else {
    // debug("None connected, create new circuit");
    connectedBoxes.add(aIndex);
    connectedBoxes.add(bIndex);

    circuits.push(new Set([aIndex, bIndex]));
    connectionRemain--;
  }

  // debug({ circuits });
  // debug("==========");

  if (connectionRemain <= 0) {
    break;
  }
}

let answer = circuits
  .toSorted(
    // From big to small
    (a, b) => b.size - a.size
  )
  .slice(0, 3)
  .map((circuit, index) => {
    // print(`#${index} - `, circuit);
    return circuit;
  })
  .reduce((previous, current) => previous * current.size, 1);

print({ answer });
