const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";

Console.WriteLine($@"
Constants:
    EXAMPLE_FILE_PATH = {EXAMPLE_FILE_PATH}
    INPUT_FILE_PATH   = {INPUT_FILE_PATH}
");

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

string[] lines = File.ReadAllLines(selectedFile);
string line = lines.First();

List<long> invalidIds = [];

foreach (var rangeString in line.Split(','))
{
    long[] range = rangeString.Split('-').Select(long.Parse).ToArray();

    long firstID = range[0];
    long lastID = range[1];

    Console.WriteLine($"{firstID} - {lastID}");

    for (var id = firstID; id <= lastID; id++)
    {
        string idString = id.ToString();

        if (idString.Length % 2 != 0) continue;

        string firstHalf = idString.Substring(0, idString.Length / 2);
        string secondHalf = idString.Substring(idString.Length / 2);

        // Console.WriteLine($"# {idString} -> {firstHalf} {secondHalf}");

        if (firstHalf.Equals(secondHalf))
        {
            Console.WriteLine($"!!! {id}");
            invalidIds.Add(id);
        }
    }
}

Console.WriteLine("---");
Console.WriteLine(invalidIds.Aggregate(0L, (first, second) => first + second));