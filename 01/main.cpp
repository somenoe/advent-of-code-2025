#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>

using namespace std;

struct Rotation
{
    char direction;
    int distance;
};

vector<Rotation> parse_input(const string &content)
{
    vector<Rotation> rotations;
    istringstream stream(content);
    string line;

    while (getline(stream, line))
    {
        if (line.empty())
            continue;

        char direction = line[0];
        int distance = stoi(line.substr(1));
        rotations.push_back({direction, distance});
    }

    return rotations;
}

size_t solve_part1(const vector<Rotation> &rotations)
{
    int dial = 50;
    size_t count = 0;

    for (const auto &rotation : rotations)
    {
        if (rotation.direction == 'L')
        {
            dial -= rotation.distance;
            // Handle wrap-around for left rotation
            dial = ((dial % 100) + 100) % 100;
        }
        else // 'R'
        {
            dial += rotation.distance;
            // Handle wrap-around for right rotation
            dial = dial % 100;
        }

        if (dial == 0)
        {
            count++;
        }
    }

    return count;
}

size_t solve_part2(const vector<Rotation> &rotations)
{
    int dial = 50;
    size_t count = 0;

    for (const auto &rotation : rotations)
    {
        int start_dial = dial;
        int end_dial;

        if (rotation.direction == 'L')
        {
            end_dial = dial - rotation.distance;
            end_dial = ((end_dial % 100) + 100) % 100;

            // Count how many times we pass through 0 during left rotation
            int distance = rotation.distance;
            int current = start_dial;
            for (int i = 0; i < distance; i++)
            {
                current--;
                if (current < 0)
                    current += 100;
                if (current == 0)
                    count++;
            }
        }
        else // 'R'
        {
            end_dial = dial + rotation.distance;
            end_dial = end_dial % 100;

            // Count how many times we pass through 0 during right rotation
            int distance = rotation.distance;
            int current = start_dial;
            for (int i = 0; i < distance; i++)
            {
                current++;
                if (current >= 100)
                    current -= 100;
                if (current == 0)
                    count++;
            }
        }

        dial = end_dial;
    }

    return count;
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
    string example_content = read_file("01/example.txt");
    auto example_rotations = parse_input(example_content);
    size_t example_result = solve_part1(example_rotations);
    cout << "Example result: " << example_result << endl;

    // Check if example result matches expected (3)
    const size_t EXPECTED_EXAMPLE = 3;
    if (example_result != EXPECTED_EXAMPLE)
    {
        cout << "ERROR: Example result " << example_result << " does not match expected "
             << EXPECTED_EXAMPLE << ". Stopping." << endl;
        return 1;
    }

    cout << "OK: Example result is correct!" << endl
         << endl;

    // Run input.txt
    cout << "Running input.txt..." << endl;
    string input_content = read_file("01/input.txt");
    auto input_rotations = parse_input(input_content);
    size_t input_result = solve_part1(input_rotations);
    cout << "Part 1 answer: " << input_result << endl
         << endl;

    cout << "=== Part 2 ===" << endl;

    // Run example.txt for part 2
    cout << "Running example.txt..." << endl;
    size_t example2_result = solve_part2(example_rotations);
    cout << "Example result: " << example2_result << endl;

    // Check if example result matches expected (6)
    const size_t EXPECTED_EXAMPLE2 = 6;
    if (example2_result != EXPECTED_EXAMPLE2)
    {
        cout << "ERROR: Example result " << example2_result << " does not match expected "
             << EXPECTED_EXAMPLE2 << ". Stopping." << endl;
        return 1;
    }

    cout << "OK: Example result is correct!" << endl
         << endl;

    // Run input.txt for part 2
    cout << "Running input.txt..." << endl;
    size_t input_result2 = solve_part2(input_rotations);
    cout << "Part 2 answer: " << input_result2 << endl;

    return 0;
}
