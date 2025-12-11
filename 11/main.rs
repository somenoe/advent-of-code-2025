#!/usr/bin/env rust-script
//! ```cargo
//! [dependencies]
//! ```

use std::collections::{HashMap, HashSet};
use std::fs;

fn parse_input(content: &str) -> HashMap<String, Vec<String>> {
    let mut graph = HashMap::new();

    for line in content.lines() {
        if line.trim().is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split(':').collect();
        if parts.len() != 2 {
            continue;
        }

        let device = parts[0].trim().to_string();
        let outputs: Vec<String> = parts[1]
            .trim()
            .split_whitespace()
            .map(|s| s.to_string())
            .collect();

        graph.insert(device, outputs);
    }

    graph
}

// Precompute which nodes can reach a target using reverse BFS
fn compute_reachable(graph: &HashMap<String, Vec<String>>, target: &str) -> HashSet<String> {
    let mut reachable = HashSet::new();
    let mut queue = vec![target.to_string()];
    reachable.insert(target.to_string());

    // Build reverse graph
    let mut reverse_graph: HashMap<String, Vec<String>> = HashMap::new();
    for (node, neighbors) in graph {
        for neighbor in neighbors {
            reverse_graph
                .entry(neighbor.clone())
                .or_insert_with(Vec::new)
                .push(node.clone());
        }
    }

    while let Some(current) = queue.pop() {
        if let Some(predecessors) = reverse_graph.get(&current) {
            for pred in predecessors {
                if !reachable.contains(pred) {
                    reachable.insert(pred.clone());
                    queue.push(pred.clone());
                }
            }
        }
    }

    reachable
}

fn count_paths(
    graph: &HashMap<String, Vec<String>>,
    current: &str,
    target: &str,
    visited: &mut HashSet<String>,
    reachable: &HashSet<String>,
) -> usize {
    // If we reached the target, we found one path
    if current == target {
        return 1;
    }

    // Mark current node as visited
    visited.insert(current.to_string());

    let mut total_paths = 0;

    // Explore all neighbors
    if let Some(neighbors) = graph.get(current) {
        for neighbor in neighbors {
            // Only visit if not already in the current path and can reach target
            if !visited.contains(neighbor) && reachable.contains(neighbor) {
                total_paths += count_paths(graph, neighbor, target, visited, reachable);
            }
        }
    }

    // Backtrack: remove current node from visited
    visited.remove(current);

    total_paths
}

fn count_paths_with_required(
    graph: &HashMap<String, Vec<String>>,
    current: &str,
    target: &str,
    required: &[&str],
    visited: &mut HashSet<String>,
    found_required: &mut HashSet<String>,
    reachable_target: &HashSet<String>,
    reachable_req: &[HashSet<String>],
    memo: &mut HashMap<(String, u8), usize>,
    call_count: &mut usize,
) -> usize {
    *call_count += 1;
    if *call_count % 100000 == 0 {
        println!("  Processed {} nodes...", call_count);
    }

    // Check if current node is one of the required nodes
    let is_required = required.contains(&current);
    if is_required {
        found_required.insert(current.to_string());
    }

    // If we reached the target, check if we visited all required nodes
    if current == target {
        let all_found = required.iter().all(|&req| found_required.contains(req));
        return if all_found { 1 } else { 0 };
    }

    // Pruning: check if we can still reach target and all missing required nodes
    if !reachable_target.contains(current) {
        if is_required {
            found_required.remove(current);
        }
        return 0;
    }
    for (i, &req) in required.iter().enumerate() {
        if !found_required.contains(req) && !reachable_req[i].contains(current) {
            if is_required {
                found_required.remove(current);
            }
            return 0;
        }
    }

    // Create a bitmask for found_required state
    let mut state_mask: u8 = 0;
    for (i, &req) in required.iter().enumerate() {
        if found_required.contains(req) {
            state_mask |= 1 << i;
        }
    }

    let memo_key = (current.to_string(), state_mask);
    if let Some(&cached) = memo.get(&memo_key) {
        if is_required {
            found_required.remove(current);
        }
        return cached;
    }

    // Mark current node as visited
    visited.insert(current.to_string());

    let mut total_paths = 0;

    // Explore all neighbors
    if let Some(neighbors) = graph.get(current) {
        for neighbor in neighbors {
            // Only visit if not already in the current path
            if !visited.contains(neighbor) {
                total_paths += count_paths_with_required(
                    graph,
                    neighbor,
                    target,
                    required,
                    visited,
                    found_required,
                    reachable_target,
                    reachable_req,
                    memo,
                    call_count,
                );
            }
        }
    }

    // Backtrack: remove current node from visited
    visited.remove(current);

    // Backtrack: unmark required if it was this node
    if is_required {
        found_required.remove(current);
    }

    // Memoize result
    memo.insert(memo_key, total_paths);

    total_paths
}

fn solve(content: &str) -> usize {
    let graph = parse_input(content);
    let reachable = compute_reachable(&graph, "out");
    let mut visited = HashSet::new();
    count_paths(&graph, "you", "out", &mut visited, &reachable)
}

fn solve_part2(content: &str) -> usize {
    let graph = parse_input(content);

    println!("Calculating Part 2... (analyzing graph)");

    let reachable_target = compute_reachable(&graph, "out");
    let reachable_dac = compute_reachable(&graph, "dac");
    let reachable_fft = compute_reachable(&graph, "fft");
    let reachable_req = vec![reachable_dac.clone(), reachable_fft.clone()];

    // Quick check: if svr can't reach required nodes or target, return 0
    if !reachable_target.contains("svr") {
        println!("SVR cannot reach OUT");
        return 0;
    }
    if !reachable_dac.contains("svr") {
        println!("SVR cannot reach dac");
        return 0;
    }
    if !reachable_fft.contains("svr") {
        println!("SVR cannot reach fft");
        return 0;
    }

    println!("Graph analysis complete. Searching paths...");

    let mut visited = HashSet::new();
    let required = vec!["dac", "fft"];
    let mut found_required = HashSet::new();
    let mut memo = HashMap::new();
    let mut call_count = 0;

    count_paths_with_required(
        &graph,
        "svr",
        "out",
        &required,
        &mut visited,
        &mut found_required,
        &reachable_target,
        &reachable_req,
        &mut memo,
        &mut call_count,
    )
}

fn main() {
    println!("=== Part 1 ===");
    // Run example.txt first
    println!("Running example.txt...");
    let example_content =
        fs::read_to_string("11/example.txt").expect("Failed to read 11/example.txt");

    let example_result = solve(&example_content);
    println!("Example result: {}", example_result);

    // Check if example result matches expected (5)
    const EXPECTED_EXAMPLE: usize = 5;
    if example_result != EXPECTED_EXAMPLE {
        println!(
            "ERROR: Example result {} does not match expected {}. Stopping.",
            example_result, EXPECTED_EXAMPLE
        );
        return;
    }

    println!("✓ Example result is correct!\n");

    // Run input.txt
    println!("Running input.txt...");
    let input_content = fs::read_to_string("11/input.txt").expect("Failed to read 11/input.txt");

    let input_result = solve(&input_content);
    println!("Part 1 answer: {}\n", input_result);

    println!("=== Part 2 ===");
    // Run example2.txt first
    println!("Running example2.txt...");
    let example2_content =
        fs::read_to_string("11/example2.txt").expect("Failed to read 11/example2.txt");

    let example2_result = solve_part2(&example2_content);
    println!("Example result: {}", example2_result);

    // Check if example result matches expected (2)
    const EXPECTED_EXAMPLE2: usize = 2;
    if example2_result != EXPECTED_EXAMPLE2 {
        println!(
            "ERROR: Example result {} does not match expected {}. Stopping.",
            example2_result, EXPECTED_EXAMPLE2
        );
        return;
    }

    println!("✓ Example result is correct!\n");

    // Run input.txt for part 2
    println!("Running input.txt...");
    let input_result2 = solve_part2(&input_content);
    println!("Part 2 answer: {}", input_result2);
}
