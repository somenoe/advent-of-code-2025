#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <sstream>
#include <algorithm>

using namespace std;

typedef map<string, vector<string>> Graph;
typedef set<string> StringSet;

Graph parse_input(const string &content)
{
    Graph graph;
    istringstream stream(content);
    string line;

    while (getline(stream, line))
    {
        if (line.empty())
            continue;

        size_t colon_pos = line.find(':');
        if (colon_pos == string::npos)
            continue;

        string device = line.substr(0, colon_pos);
        // Trim whitespace from device
        device.erase(device.find_last_not_of(" \t") + 1);
        device.erase(0, device.find_first_not_of(" \t"));

        string outputs_str = line.substr(colon_pos + 1);
        vector<string> outputs;
        istringstream outputs_stream(outputs_str);
        string output;
        while (outputs_stream >> output)
        {
            outputs.push_back(output);
        }

        graph[device] = outputs;
    }

    return graph;
}

// Build reverse graph and compute reachable nodes
StringSet compute_reachable(const Graph &graph, const string &target)
{
    StringSet reachable;
    vector<string> queue;
    queue.push_back(target);
    reachable.insert(target);

    // Build reverse graph
    map<string, vector<string>> reverse_graph;
    for (const auto &[node, neighbors] : graph)
    {
        for (const auto &neighbor : neighbors)
        {
            reverse_graph[neighbor].push_back(node);
        }
    }

    size_t idx = 0;
    while (idx < queue.size())
    {
        string current = queue[idx++];
        if (reverse_graph.find(current) != reverse_graph.end())
        {
            for (const auto &pred : reverse_graph[current])
            {
                if (reachable.find(pred) == reachable.end())
                {
                    reachable.insert(pred);
                    queue.push_back(pred);
                }
            }
        }
    }

    return reachable;
}

size_t count_paths(
    const Graph &graph,
    const string &current,
    const string &target,
    StringSet &visited,
    const StringSet &reachable)
{

    if (current == target)
    {
        return 1;
    }

    visited.insert(current);

    size_t total_paths = 0;

    if (graph.find(current) != graph.end())
    {
        for (const auto &neighbor : graph.at(current))
        {
            if (visited.find(neighbor) == visited.end() && reachable.find(neighbor) != reachable.end())
            {
                total_paths += count_paths(graph, neighbor, target, visited, reachable);
            }
        }
    }

    visited.erase(current);

    return total_paths;
}

size_t count_paths_with_required(
    const Graph &graph,
    const string &current,
    const string &target,
    const vector<string> &required,
    StringSet &visited,
    StringSet &found_required,
    const StringSet &reachable_target,
    const vector<StringSet> &reachable_req,
    map<pair<string, unsigned char>, size_t> &memo,
    size_t &call_count)
{

    call_count++;
    if (call_count % 100000 == 0)
    {
        cout << "  Processed " << call_count << " nodes..." << endl;
    }

    // Check if current node is one of the required nodes
    bool is_required = find(required.begin(), required.end(), current) != required.end();
    if (is_required)
    {
        found_required.insert(current);
    }

    // If we reached the target, check if we visited all required nodes
    if (current == target)
    {
        bool all_found = true;
        for (const auto &req : required)
        {
            if (found_required.find(req) == found_required.end())
            {
                all_found = false;
                break;
            }
        }
        if (is_required)
        {
            found_required.erase(current);
        }
        return all_found ? 1 : 0;
    }

    // Pruning: check if we can still reach target
    if (reachable_target.find(current) == reachable_target.end())
    {
        if (is_required)
        {
            found_required.erase(current);
        }
        return 0;
    }

    // Pruning: check if we can reach all missing required nodes
    for (size_t i = 0; i < required.size(); i++)
    {
        if (found_required.find(required[i]) == found_required.end() &&
            reachable_req[i].find(current) == reachable_req[i].end())
        {
            if (is_required)
            {
                found_required.erase(current);
            }
            return 0;
        }
    }

    // Create a bitmask for found_required state
    unsigned char state_mask = 0;
    for (size_t i = 0; i < required.size(); i++)
    {
        if (found_required.find(required[i]) != found_required.end())
        {
            state_mask |= (1 << i);
        }
    }

    pair<string, unsigned char> memo_key = {current, state_mask};
    if (memo.find(memo_key) != memo.end())
    {
        if (is_required)
        {
            found_required.erase(current);
        }
        return memo[memo_key];
    }

    visited.insert(current);

    size_t total_paths = 0;

    if (graph.find(current) != graph.end())
    {
        for (const auto &neighbor : graph.at(current))
        {
            if (visited.find(neighbor) == visited.end())
            {
                total_paths += count_paths_with_required(
                    graph, neighbor, target, required, visited, found_required,
                    reachable_target, reachable_req, memo, call_count);
            }
        }
    }

    visited.erase(current);

    if (is_required)
    {
        found_required.erase(current);
    }

    memo[memo_key] = total_paths;

    return total_paths;
}

size_t solve(const string &content)
{
    Graph graph = parse_input(content);
    StringSet reachable = compute_reachable(graph, "out");
    StringSet visited;
    return count_paths(graph, "you", "out", visited, reachable);
}

size_t solve_part2(const string &content)
{
    Graph graph = parse_input(content);

    cout << "Calculating Part 2... (analyzing graph)" << endl;

    StringSet reachable_target = compute_reachable(graph, "out");
    StringSet reachable_dac = compute_reachable(graph, "dac");
    StringSet reachable_fft = compute_reachable(graph, "fft");
    vector<StringSet> reachable_req = {reachable_dac, reachable_fft};

    // Quick check: if svr can't reach required nodes or target, return 0
    if (reachable_target.find("svr") == reachable_target.end())
    {
        cout << "SVR cannot reach OUT" << endl;
        return 0;
    }
    if (reachable_dac.find("svr") == reachable_dac.end())
    {
        cout << "SVR cannot reach dac" << endl;
        return 0;
    }
    if (reachable_fft.find("svr") == reachable_fft.end())
    {
        cout << "SVR cannot reach fft" << endl;
        return 0;
    }

    cout << "Graph analysis complete. Searching paths..." << endl;

    StringSet visited;
    vector<string> required = {"dac", "fft"};
    StringSet found_required;
    map<pair<string, unsigned char>, size_t> memo;
    size_t call_count = 0;

    return count_paths_with_required(
        graph, "svr", "out", required, visited, found_required,
        reachable_target, reachable_req, memo, call_count);
}

string read_file(const string &path)
{
    ifstream file(path);
    if (!file.is_open())
    {
        throw runtime_error("Failed to read file: " + path);
    }
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

int main()
{
    cout << "=== Part 1 ===" << endl;

    // Run example.txt first
    cout << "Running example.txt..." << endl;
    string example_content = read_file("11/example.txt");
    size_t example_result = solve(example_content);
    cout << "Example result: " << example_result << endl;

    // Check if example result matches expected (5)
    const size_t EXPECTED_EXAMPLE = 5;
    if (example_result != EXPECTED_EXAMPLE)
    {
        cout << "ERROR: Example result " << example_result << " does not match expected "
             << EXPECTED_EXAMPLE << ". Stopping." << endl;
        return 1;
    }

    cout << "✓ Example result is correct!" << endl
         << endl;

    // Run input.txt
    cout << "Running input.txt..." << endl;
    string input_content = read_file("11/input.txt");
    size_t input_result = solve(input_content);
    cout << "Part 1 answer: " << input_result << endl
         << endl;

    cout << "=== Part 2 ===" << endl;

    // Run example2.txt first
    cout << "Running example2.txt..." << endl;
    string example2_content = read_file("11/example2.txt");
    size_t example2_result = solve_part2(example2_content);
    cout << "Example result: " << example2_result << endl;

    // Check if example result matches expected (2)
    const size_t EXPECTED_EXAMPLE2 = 2;
    if (example2_result != EXPECTED_EXAMPLE2)
    {
        cout << "ERROR: Example result " << example2_result << " does not match expected "
             << EXPECTED_EXAMPLE2 << ". Stopping." << endl;
        return 1;
    }

    cout << "✓ Example result is correct!" << endl
         << endl;

    // Run input.txt for part 2
    cout << "Running input.txt..." << endl;
    size_t input_result2 = solve_part2(input_content);
    cout << "Part 2 answer: " << input_result2 << endl;

    return 0;
}
