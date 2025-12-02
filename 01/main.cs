const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";
const int INITIAL_DIAL_VALUE = 50;
const int MAX_DIAL_VALUE = 99;

Console.WriteLine($@"
Constants:
    EXAMPLE_FILE_PATH = {EXAMPLE_FILE_PATH}
    INPUT_FILE_PATH   = {INPUT_FILE_PATH}
    START_AT          = {INITIAL_DIAL_VALUE}
");

int dial = INITIAL_DIAL_VALUE;
int zeroPointCounter = 0;
string[] lines = File.ReadAllLines(INPUT_FILE_PATH);

foreach (string line in lines)
{
    char rotationType = line[0];
    string rotateString = new(line.Where(char.IsDigit).ToArray());
    int rotationAngle = int.Parse(rotateString);
    Console.WriteLine($"{rotationType} {rotationAngle}\t#{dial}");

    switch (rotationType)
    {
        case 'L':
            dial -= rotationAngle;
            if (dial < 0) dial = MAX_DIAL_VALUE + 1 + dial;
            break;
        case 'R':
            dial += rotationAngle;
            if (dial > MAX_DIAL_VALUE) dial -= MAX_DIAL_VALUE + 1;
            break;
        default:
            throw new Exception($"Unknow rotation type: {rotationType}");
    }

    if (dial == 0) zeroPointCounter++;
}

Console.WriteLine($"Actual password: {zeroPointCounter}");