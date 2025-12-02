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

foreach (string line in lines)
{
    Console.WriteLine(line);
}