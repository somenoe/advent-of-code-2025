/**
 * PROBLEM (PART 2):
 *
 * Joltage puzzle solver - Part 2 ONLY (ignore lights)
 *
 * Each machine has numeric counters tracking joltage levels (all start at 0).
 * Buttons ADD 1 to specific counters (not toggle/XOR like Part 1).
 * Goal: find minimum button presses to reach target joltage levels.
 *
 * This is a system of linear equations in non-negative integers:
 * - Each button is a variable (number of presses)
 * - Each joltage counter is an equation
 * - Solve using Gaussian elimination (standard arithmetic, not GF(2))
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
auto extractJoltageRequirements = [](const string &line) -> vector<int>
{
    regex joltageRegex(R"(\{([0-9,]+)\})");
    smatch joltageMatch;
    if (regex_search(line, joltageMatch, joltageRegex))
    {
        const string &reqs = joltageMatch[1].str();
        vector<int> result;
        stringstream ss(reqs);
        string num;
        while (getline(ss, num, ','))
        {
            result.push_back(stoi(num));
        }
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
    vector<int> joltage;
    vector<vector<int>> buttons;
};

Machine parseLine(const string &line)
{
    return Machine{
        extractJoltageRequirements(line),
        extractButtons(line)};
}

// Build matrix for additive system (joltage counters)
auto buildJoltageMatrix = [](const Machine &machine)
{
    const int numJoltages = machine.joltage.size();
    const int numButtons = machine.buttons.size();

    vector<vector<long long>> matrix(numJoltages, vector<long long>(numButtons + 1, 0));

    // Populate matrix: each button is a column, each joltage is a row
    for (int b = 0; b < numButtons; ++b)
    {
        for (int jIdx : machine.buttons[b])
        {
            if (jIdx < numJoltages)
                matrix[jIdx][b] = 1;
        }
    }

    // Add target joltages as augmented column
    for (int i = 0; i < numJoltages; ++i)
    {
        matrix[i][numButtons] = machine.joltage[i];
    }

    return matrix;
};

// Gaussian elimination for integer linear equations
auto performGaussianElimination = [](vector<vector<long long>> matrix)
{
    const int numJoltages = matrix.size();
    const int numButtons = matrix[0].size() - 1;

    int rank = 0;
    vector<int> pivotCol(numJoltages, -1);

    for (int col = 0; col < numButtons && rank < numJoltages; ++col)
    {
        // Find pivot with non-zero value
        int pivotRow = -1;
        for (int i = rank; i < numJoltages; ++i)
        {
            if (matrix[i][col] != 0)
            {
                pivotRow = i;
                break;
            }
        }

        if (pivotRow == -1)
            continue;

        swap(matrix[rank], matrix[pivotRow]);
        pivotCol[rank] = col;

        // Eliminate this column in all other rows
        long long pivot = matrix[rank][col];
        for (int i = 0; i < numJoltages; ++i)
        {
            if (i != rank && matrix[i][col] != 0)
            {
                long long factor = matrix[i][col];
                for (int j = 0; j <= numButtons; ++j)
                {
                    matrix[i][j] = matrix[i][j] * pivot - matrix[rank][j] * factor;
                }
            }
        }

        rank++;
    }

    return make_pair(matrix, rank);
};

// Check inconsistency in augmented matrix
auto hasInconsistency = [](const pair<vector<vector<long long>>, int> &state)
{
    const auto &matrix = state.first;
    const int rank = state.second;
    const int numButtons = matrix[0].size() - 1;

    // Check for rows like [0 0 0 ... | non-zero], which is impossible
    for (int i = rank; i < (int)matrix.size(); ++i)
    {
        bool allZero = true;
        for (int j = 0; j < numButtons; ++j)
        {
            if (matrix[i][j] != 0)
            {
                allZero = false;
                break;
            }
        }
        if (allZero && matrix[i][numButtons] != 0)
        {
            return true;
        }
    }
    return false;
};

// Core solver - find minimum nonnegative integer solution
long long findMinPresses(const Machine &machine)
{
    const int numJoltages = machine.joltage.size();
    const int numButtons = machine.buttons.size();

    auto matrix = buildJoltageMatrix(machine);
    auto [eliminatedMatrix, rank] = performGaussianElimination(matrix);

    if (hasInconsistency(make_pair(eliminatedMatrix, rank)))
    {
        debug("Inconsistent system");
        return 0;
    }

    // Identify free variables and pivot columns
    vector<bool> isBasic(numButtons, false);
    vector<int> pivotCol(rank, -1);

    for (int i = 0; i < rank; ++i)
    {
        for (int j = 0; j < numButtons; ++j)
        {
            if (eliminatedMatrix[i][j] != 0)
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

    debug("Rank:", rank, "Free vars:", (int)freeVars.size());

    // Helper function to check if a solution is valid and count presses
    auto checkSolution = [&](const vector<long long> &freeVarValues) -> pair<bool, long long>
    {
        vector<long long> solution(numButtons, 0);
        for (size_t i = 0; i < freeVars.size(); ++i)
        {
            solution[freeVars[i]] = freeVarValues[i];
        }

        // Back-substitute to find basic variable values
        for (int i = rank - 1; i >= 0; --i)
        {
            int col = pivotCol[i];
            if (col == -1)
                continue;

            long long rhs = eliminatedMatrix[i][numButtons];
            for (int j = col + 1; j < numButtons; ++j)
            {
                rhs -= eliminatedMatrix[i][j] * solution[j];
            }

            if (eliminatedMatrix[i][col] == 0)
                return {false, 0};

            if (rhs % eliminatedMatrix[i][col] != 0)
                return {false, 0};

            long long val = rhs / eliminatedMatrix[i][col];
            if (val < 0)
                return {false, 0};

            solution[col] = val;
        }

        long long totalPresses = accumulate(solution.begin(), solution.end(), 0LL);
        return {true, totalPresses};
    };

    // If no free variables, there's a unique solution
    if (freeVars.empty())
    {
        auto [valid, presses] = checkSolution({});
        return valid ? presses : 0;
    }

    // For free variables, use recursive branch-and-bound with greedy optimization
    long long minPresses = LLONG_MAX;
    bool foundSolution = false;

    // Compute upper bounds for each free variable based on minimum target joltage
    long long maxTarget = 0;
    for (int j : machine.joltage)
    {
        maxTarget = max(maxTarget, (long long)j);
    }
    const long long maxFreeVarValue = maxTarget + 100;

    // Recursive branch-and-bound search with pruning
    function<void(int, vector<long long> &, long long)> search =
        [&](int freeVarIdx, vector<long long> &freeVarValues, long long currentSum)
    {
        // Prune: if current sum already exceeds best, stop
        if (currentSum >= minPresses)
            return;

        // Base case: all free variables assigned
        if (freeVarIdx == (int)freeVars.size())
        {
            auto [valid, presses] = checkSolution(freeVarValues);
            if (valid)
            {
                minPresses = min(minPresses, presses);
                foundSolution = true;
            }
            return;
        }

        // Try values for this free variable, starting from 0
        // Limit search to avoid explosion; adaptive based on remaining budget
        long long remainingBudget = max(100LL, minPresses - currentSum);
        for (long long val = 0; val <= min(maxFreeVarValue, remainingBudget); ++val)
        {
            freeVarValues[freeVarIdx] = val;
            search(freeVarIdx + 1, freeVarValues, currentSum + val);
        }
    };

    vector<long long> freeVarValues(freeVars.size(), 0);
    search(0, freeVarValues, 0);

    return foundSolution ? minPresses : 0;
}

int main(int argc, char *argv[])
{
    const string folder = (argc > 2) ? argv[2] : ".";
    const string filename = (argc > 1 && string(argv[1]) == "i") ? "input.txt" : "example.txt";
    const string inputFilePath = folder + "/" + filename;

    auto lines = readLines(inputFilePath);

    debug("Lines:", (int)lines.size());

    int idx = 0;
    long long totalMinPresses = accumulate(
        lines.begin(),
        lines.end(),
        0LL,
        [&idx](long long total, const string &line) mutable
        {
            ++idx;
            const auto machine = parseLine(line);
            const long long presses = findMinPresses(machine);
            debug("Machine", idx, "- Min presses:", presses);
            return total + presses;
        });

    print("Total minimum presses:", totalMinPresses);

    return 0;
}
