const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

string[] lines = File.ReadAllLines(selectedFile);

long totalOutputJoltage = 0;

int[][] joltageRatings = lines.Select(line => line.Select(c => int.Parse(c.ToString())).ToArray()).ToArray();

const int BATTERIES_LENGTH = 12;
foreach (int[] line in joltageRatings)
{
    int[] batteries = new int[BATTERIES_LENGTH];

    for (int i = 0; i < line.Length; i++)
    {
        int currentJoltage = line[i];
        bool isFoundNewLargest = false;
        int startCheckingBatteriesIndex = (line.Length - i) > BATTERIES_LENGTH ? 0 : BATTERIES_LENGTH - (line.Length - i);
        for (int j = startCheckingBatteriesIndex; j < batteries.Length; j++)
        {
            if (isFoundNewLargest)
            {
                batteries[j] = 0;
                continue;
            }
            if (currentJoltage > batteries[j])
            {
                batteries[j] = currentJoltage;
                isFoundNewLargest = true;
            }
        }

    }

    Console.WriteLine($"{string.Join("", line)} - {string.Join("", batteries)}");

    totalOutputJoltage += long.Parse(string.Join("", batteries));
}

Console.WriteLine($"Total output Joltage: {totalOutputJoltage}");
