#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>

using namespace std;

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

int main(int argc, char *argv[])
{
    string folder = (argc > 2) ? argv[2] : ".";
    string filename = (argc > 1 && string(argv[1]) == "i") ? "input.txt" : "example.txt";
    string inputFilePath = folder + "/" + filename;
    vector<string> lines = readLines(inputFilePath);

    debug("Lines:", lines.size());

    return 0;
}
