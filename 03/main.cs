const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

string[] lines = File.ReadAllLines(selectedFile);

foreach (string line in lines)
{
    Console.WriteLine(line);
}

