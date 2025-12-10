/**
 * PROBLEM:
 *
 * This is a light puzzle solver. Imagine you have a machine with lights and buttons:
 * - Some lights are on (marked with #) and some are off (marked with .)
 * - Each button toggles (turns on/off) a specific group of lights
 *
 * GOAL:
 *
 * Find the minimum number of button presses to match a target light pattern
 *
 * SOLUTION:
 *
 * We treat this as a math problem (like solving equations):
 * 1. Create a matrix (table) where each button is a column and each light is a row
 * 2. Mark which lights each button affects with 1s and 0s
 * 3. Use Gaussian elimination (a standard math technique) to simplify the problem
 * 4. If there's no solution, return 0
 * 5. If there are multiple solutions, test each one and pick the one with fewest button presses
 *
 * The key insight: We work in binary (on/off) world where pressing a button twice = not pressing it
 */

#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <regex>
#include <algorithm>
#include <limits>
#include <numeric>
#include <functional>

using namespace std;

// ==================================
// Utility functions
// ==================================

constexpr bool DEBUG = true;

template <typename... Args>
void print(Args &&...args)
{
    ((cout << args << " "), ...) << "\n";
}

template <typename... Args>
void debug(Args &&...args)
{
    if (DEBUG)
    {
        print(args...);
    }
}

vector<string> readLines(const string &filename)
{
    ifstream file(filename);
    vector<string> lines;
    string line;

    while (getline(file, line))
    {
        lines.push_back(line);
    }

    return lines;
}

// ==================================
// Problem-specific code
// ==================================

// Parsing helpers
auto extractTargetDiagram = [](const string &line) -> vector<bool>
{
    regex targetRegex(R"(\[([.#]+)\])");
    smatch targetMatch;
    if (regex_search(line, targetMatch, targetRegex))
    {
        const string &diagram = targetMatch[1].str();
        vector<bool> result;
        result.reserve(diagram.size());
        transform(diagram.begin(), diagram.end(), back_inserter(result),
                  [](char c)
                  { return c == '#'; });
        return result;
    }
    return {};
};

auto extractButtons = [](const string &line) -> vector<vector<int>>
{
    regex buttonRegex(R"(\(([0-9,]+)\))");
    smatch buttonMatch;
    vector<vector<int>> buttons;
    string::const_iterator searchStart(line.cbegin());

    while (regex_search(searchStart, line.cend(), buttonMatch, buttonRegex))
    {
        vector<int> button;
        stringstream ss(buttonMatch[1].str());
        string num;
        while (getline(ss, num, ','))
        {
            button.push_back(stoi(num));
        }
        buttons.push_back(move(button));
        searchStart = buttonMatch.suffix().first;
    }
    return buttons;
};

struct Machine
{
    vector<bool> target;
    vector<vector<int>> buttons;
};

Machine parseLine(const string &line)
{
    return Machine{
        extractTargetDiagram(line),
        extractButtons(line)};
}

// Matrix builder
auto buildMatrix = [](const Machine &machine)
{
    const int numLights = machine.target.size();
    const int numButtons = machine.buttons.size();

    vector<vector<int>> matrix(numLights, vector<int>(numButtons + 1, 0));

    // Populate matrix from buttons
    for (int b = 0; b < numButtons; ++b)
    {
        for (int lightIdx : machine.buttons[b])
        {
            matrix[lightIdx][b] = 1;
        }
    }

    // Add target as augmented column
    for (int i = 0; i < numLights; ++i)
    {
        matrix[i][numButtons] = machine.target[i] ? 1 : 0;
    }

    return matrix;
};

// Gaussian elimination (GF(2))
auto performGaussianElimination = [](vector<vector<int>> matrix)
{
    const int numLights = matrix.size();
    const int numButtons = matrix[0].size() - 1;

    int rank = 0;
    vector<int> pivotCol(numLights, -1);

    for (int col = 0; col < numButtons && rank < numLights; ++col)
    {
        // Find pivot
        auto pivotIt = find_if(matrix.begin() + rank, matrix.end(),
                               [col](const vector<int> &row)
                               { return row[col] == 1; });

        if (pivotIt == matrix.end())
            continue;

        int pivotRow = distance(matrix.begin(), pivotIt);
        swap(matrix[rank], matrix[pivotRow]);
        pivotCol[rank] = col;

        // Row elimination
        for_each(matrix.begin(), matrix.end(),
                 [rank, col, &matrix, numButtons](vector<int> &row)
                 {
                     if (&row != &matrix[rank] && row[col] == 1)
                     {
                         for (int j = 0; j <= numButtons; ++j)
                         {
                             row[j] ^= matrix[rank][j];
                         }
                     }
                 });

        rank++;
    }

    return make_pair(matrix, rank);
};

// Check inconsistency in augmented matrix
auto hasInconistency = [](const pair<vector<vector<int>>, int> &state)
{
    const auto &matrix = state.first;
    const int rank = state.second;
    const int numButtons = matrix[0].size() - 1;

    return any_of(matrix.begin() + rank, matrix.end(),
                  [numButtons](const vector<int> &row)
                  {
                      return row[numButtons] == 1;
                  });
};

// Identify free variables (non-pivot columns)
auto getFreeVariables = [](const pair<vector<vector<int>>, int> &state)
{
    const auto &pivotCols = state.first;
    const int rank = state.second;
    const int numButtons = pivotCols[0].size() - 1;

    vector<bool> isBasic(numButtons, false);
    for (int i = 0; i < rank; ++i)
    {
        // This is a simplified approach - in practice we'd track pivotCol separately
        for (int j = 0; j < numButtons; ++j)
        {
            if (pivotCols[i][j] == 1)
                isBasic[j] = true;
        }
    }

    vector<int> freeVars;
    for (int i = 0; i < numButtons; ++i)
    {
        if (!isBasic[i])
            freeVars.push_back(i);
    }
    return freeVars;
};

// Evaluate a solution given a free-variable mask
auto evaluateSolution = [](const vector<vector<int>> &matrix,
                           const vector<int> &freeVars,
                           const int rank,
                           int mask)
{
    const int numButtons = matrix[0].size() - 1;
    vector<int> solution(numButtons, 0);

    // Set free variables based on mask
    for (int i = 0; i < freeVars.size(); ++i)
    {
        solution[freeVars[i]] = (mask >> i) & 1;
    }

    // Back-substitution
    for (int i = rank - 1; i >= 0; --i)
    {
        int col = -1;
        for (int j = 0; j < numButtons; ++j)
        {
            if (matrix[i][j] == 1)
            {
                col = j;
                break;
            }
        }

        if (col == -1)
            continue;

        int val = matrix[i][numButtons];
        for (int j = col + 1; j < numButtons; ++j)
        {
            val ^= (matrix[i][j] & solution[j]);
        }
        solution[col] = val;
    }

    // Count presses using std::accumulate
    return accumulate(solution.begin(), solution.end(), 0);
};

// Core solver
int findMinPresses(const Machine &machine)
{
    const int numLights = machine.target.size();
    const int numButtons = machine.buttons.size();

    auto matrix = buildMatrix(machine);
    auto [eliminatedMatrix, rank] = performGaussianElimination(matrix);

    if (hasInconistency(make_pair(eliminatedMatrix, rank)))
        return 0;

    // Identify free variables and compute pivot columns
    vector<bool> isBasic(numButtons, false);
    vector<int> pivotCol(numLights, -1);

    for (int i = 0; i < rank; ++i)
    {
        for (int j = 0; j < numButtons; ++j)
        {
            if (eliminatedMatrix[i][j] == 1)
            {
                pivotCol[i] = j;
                isBasic[j] = true;
                break;
            }
        }
    }

    vector<int> freeVars;
    for (int i = 0; i < numButtons; ++i)
    {
        if (!isBasic[i])
            freeVars.push_back(i);
    }

    // Enumerate solutions using functional approach
    const int numFreeVars = freeVars.size();
    if (numFreeVars > 20)
        return 0;

    vector<int> allPresses;
    allPresses.reserve(1 << numFreeVars);

    for (int mask = 0; mask < (1 << numFreeVars); ++mask)
    {
        vector<int> solution(numButtons, 0);

        for (int i = 0; i < numFreeVars; ++i)
        {
            solution[freeVars[i]] = (mask >> i) & 1;
        }

        for (int i = rank - 1; i >= 0; --i)
        {
            int col = pivotCol[i];
            if (col == -1)
                continue;

            int val = eliminatedMatrix[i][numButtons];
            for (int j = col + 1; j < numButtons; ++j)
            {
                val ^= (eliminatedMatrix[i][j] & solution[j]);
            }
            solution[col] = val;
        }

        int totalPresses = accumulate(solution.begin(), solution.end(), 0);
        allPresses.push_back(totalPresses);
    }

    return *min_element(allPresses.begin(), allPresses.end());
}

int main(int argc, char *argv[])
{
    const string folder = (argc > 2) ? argv[2] : ".";
    const string filename = (argc > 1 && string(argv[1]) == "i") ? "input.txt" : "example.txt";
    const string inputFilePath = folder + "/" + filename;

    auto lines = readLines(inputFilePath);

    debug("Lines:", lines.size());

    int idx = 0;
    int totalMinPresses = accumulate(
        lines.begin(),
        lines.end(),
        0,
        [&idx](int total, const string &line) mutable
        {
            ++idx;
            const auto machine = parseLine(line);
            const int presses = findMinPresses(machine);
            debug("Machine", idx, "- Min presses:", presses);
            return total + presses;
        });

    print("Total minimum presses:", totalMinPresses);

    return 0;
}
