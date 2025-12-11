#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <chrono>

using namespace std;

struct Range
{
    long long start;
    long long end;
};

vector<Range> parse_input(const string &content)
{
    vector<Range> ranges;
    istringstream stream(content);
    string line;

    while (getline(stream, line))
    {
        if (line.empty())
            continue;

        // Split by commas
        size_t start_pos = 0;
        while (start_pos < line.length())
        {
            size_t comma_pos = line.find(',', start_pos);
            if (comma_pos == string::npos)
                comma_pos = line.length();

            string range_str = line.substr(start_pos, comma_pos - start_pos);

            // Parse range: "start-end"
            size_t dash_pos = range_str.find('-');
            if (dash_pos != string::npos)
            {
                long long start = stoll(range_str.substr(0, dash_pos));
                long long end = stoll(range_str.substr(dash_pos + 1));
                ranges.push_back({start, end});
            }

            start_pos = comma_pos + 1;
        }
    }

    return ranges;
}

bool is_repeated_pattern_part1(long long num)
{
    string s = to_string(num);
    int len = s.length();

    // Check if length is even
    if (len % 2 != 0)
        return false;

    int half = len / 2;
    string first_half = s.substr(0, half);
    string second_half = s.substr(half);

    return first_half == second_half;
}

bool is_repeated_pattern_part2(long long num)
{
    string s = to_string(num);
    int len = s.length();

    // Try all possible pattern lengths from 1 to len/2
    for (int pattern_len = 1; pattern_len <= len / 2; pattern_len++)
    {
        if (len % pattern_len != 0)
            continue;

        string pattern = s.substr(0, pattern_len);
        bool matches = true;

        for (int i = 0; i < len; i += pattern_len)
        {
            if (s.substr(i, pattern_len) != pattern)
            {
                matches = false;
                break;
            }
        }

        if (matches)
            return true;
    }

    return false;
}

long long solve_part1(const vector<Range> &ranges)
{
    long long total = 0;

    for (const auto &range : ranges)
    {
        for (long long id = range.start; id <= range.end; id++)
        {
            if (is_repeated_pattern_part1(id))
            {
                total += id;
            }
        }
    }

    return total;
}

long long solve_part2(const vector<Range> &ranges)
{
    long long total = 0;

    for (const auto &range : ranges)
    {
        for (long long id = range.start; id <= range.end; id++)
        {
            if (is_repeated_pattern_part2(id))
            {
                total += id;
            }
        }
    }

    return total;
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
    string example_content = read_file("02/example.txt");
    vector<Range> example_ranges = parse_input(example_content);

    auto start_time = chrono::high_resolution_clock::now();
    long long example_result = solve_part1(example_ranges);
    auto end_time = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(end_time - start_time);

    cout << "Example result: " << example_result << endl;
    cout << "Time: " << duration.count() << " ms" << endl;

    // Check if example result matches expected (1227775554)
    const long long EXPECTED_EXAMPLE = 1227775554;
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
    string input_content = read_file("02/input.txt");
    vector<Range> input_ranges = parse_input(input_content);

    start_time = chrono::high_resolution_clock::now();
    long long input_result = solve_part1(input_ranges);
    end_time = chrono::high_resolution_clock::now();
    duration = chrono::duration_cast<chrono::milliseconds>(end_time - start_time);

    cout << "Part 1 answer: " << input_result << endl;
    cout << "Time: " << duration.count() << " ms" << endl
         << endl;

    cout << "=== Part 2 ===" << endl;

    // Run example.txt first
    cout << "Running example.txt..." << endl;
    start_time = chrono::high_resolution_clock::now();
    long long example2_result = solve_part2(example_ranges);
    end_time = chrono::high_resolution_clock::now();
    duration = chrono::duration_cast<chrono::milliseconds>(end_time - start_time);

    cout << "Example result: " << example2_result << endl;
    cout << "Time: " << duration.count() << " ms" << endl;

    // Check if example result matches expected (4174379265)
    const long long EXPECTED_EXAMPLE2 = 4174379265;
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
    start_time = chrono::high_resolution_clock::now();
    long long input_result2 = solve_part2(input_ranges);
    end_time = chrono::high_resolution_clock::now();
    duration = chrono::duration_cast<chrono::milliseconds>(end_time - start_time);

    cout << "Part 2 answer: " << input_result2 << endl;
    cout << "Time: " << duration.count() << " ms" << endl;

    return 0;
}
