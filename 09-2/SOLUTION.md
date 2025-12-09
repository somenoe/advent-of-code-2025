---
Solved by: Claude Opus 4.5
---

# Day 9 Part 2 - Solution Explanation

## Problem Summary

We need to find the **largest rectangle** using:

- **Red tiles** as opposite corners (from input)
- Only **red or green tiles** inside the rectangle

## Key Observations

1. **Red tiles** are the corner points given in the input (polygon vertices)
2. **Green tiles** are:
   - Tiles on edges connecting adjacent red points (horizontal/vertical lines)
   - All tiles **inside** the polygon formed by the closed loop
3. The input forms a **closed rectilinear polygon** (last point connects back to first)
4. All edges are axis-aligned (horizontal or vertical)

## Algorithm

### Step 1: Parse the polygon vertices (red tiles)

Read all corner positions from input as polygon vertices.

### Step 2: Build polygon edges

For each pair of adjacent vertices, create an edge segment (horizontal or vertical).

### Step 3: Point validation (is tile red or green?)

For any point, check if it's valid (red or green) by:

1. Check if it's on any polygon edge → **green edge tile**
2. Use **ray casting algorithm** to check if point is inside polygon → **green interior tile**
3. Cache results to avoid recomputation

### Step 4: Rectangle validation

For a rectangle with red tile corners to be valid, ALL tiles inside must be red or green:

1. Check all 4 corners are inside/on polygon
2. For each polygon edge that crosses through the rectangle interior:
   - Check points on both sides of the edge to ensure no "outside" region exists
   - This handles cases where the polygon boundary cuts through the rectangle

### Step 5: Find largest valid rectangle

1. Generate all pairs of red tiles as potential opposite corners
2. Sort by area descending (optimization: check largest first)
3. For each pair, validate the rectangle
4. Early termination: once a valid rectangle is found, skip smaller ones

## Optimization for Large Input

- **No grid allocation**: Work with sparse coordinates only
- **Caching**: Cache point-in-polygon results in a Map
- **Sorted search**: Check largest rectangles first, break early when found
- **Geometric checks**: Instead of checking every tile, only check:
  - 4 corners
  - Critical points where polygon edges intersect the rectangle

## Complexity

- N = number of red tiles
- E = number of edges (same as N)
- Rectangle pairs: O(N²)
- Validation per rectangle: O(E) edge checks + O(E) ray casting per point
- Total: O(N² × E) with heavy caching

## Expected Output

- Example input: **24**
- Real input: **1578115935**
