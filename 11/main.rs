#!/usr/bin/env rust-script
//! ```cargo
//! [dependencies]
//! ```

use std::collections::HashMap;
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

fn count_paths(
    graph: &HashMap<String, Vec<String>>,
    current: &str,
    target: &str,
    visited: &mut Vec<String>,
) -> usize {
    // If we reached the target, we found one path
    if current == target {
        return 1;
    }

    // Mark current node as visited
    visited.push(current.to_string());

    let mut total_paths = 0;

    // Explore all neighbors
    if let Some(neighbors) = graph.get(current) {
        for neighbor in neighbors {
            // Only visit if not already in the current path (to avoid cycles)
            if !visited.contains(neighbor) {
                total_paths += count_paths(graph, neighbor, target, visited);
            }
        }
    }

    // Backtrack: remove current node from visited
    visited.pop();

    total_paths
}

fn solve(content: &str) -> usize {
    let graph = parse_input(content);
    let mut visited = Vec::new();
    count_paths(&graph, "you", "out", &mut visited)
}

fn main() {
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
    println!("Input result: {}", input_result);
}
