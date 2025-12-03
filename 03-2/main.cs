const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

string[] lines = File.ReadAllLines(selectedFile);

int totalOutputJoltage = 0;

int[][] joltageRatings = lines.Select(line => line.Select(c => int.Parse(c.ToString())).ToArray()).ToArray();

foreach (int[] line in joltageRatings)
{
    int first = 0;
    int second = 0;

    for (int i = 0; i < line.Length - 1; i++)
    {
        int currentJoltage = line[i];
        if (currentJoltage > first)
        {
            first = currentJoltage;
            second = 0;
        }
        else if (currentJoltage > second)
        {
            second = currentJoltage;
        }

    }
    if (line[^1] > second)
    {
        second = line[^1];
    }
    Console.WriteLine($"{string.Join("", line)} - {first} {second}");

    totalOutputJoltage += first * 10 + second;
}

Console.WriteLine($"Total output Joltage: {totalOutputJoltage}");
