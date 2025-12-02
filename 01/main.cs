const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";
const int START_AT = 50;

Console.WriteLine($@"
Constants:
    EXAMPLE_FILE_PATH = {EXAMPLE_FILE_PATH}
    INPUT_FILE_PATH   = {INPUT_FILE_PATH}
    START_AT          = {START_AT}
");

string[] lines = File.ReadAllLines(EXAMPLE_FILE_PATH);

foreach (string line in lines)
{
    Console.WriteLine(line);
}