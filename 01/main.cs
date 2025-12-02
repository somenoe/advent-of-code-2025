const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";
const int INITIAL_DIAL_VALUE = 50;
const int DIAL_POSITIONS = 100;

Console.WriteLine($@"
Constants:
    EXAMPLE_FILE_PATH = {EXAMPLE_FILE_PATH}
    INPUT_FILE_PATH   = {INPUT_FILE_PATH}
    START_AT          = {INITIAL_DIAL_VALUE}
");

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

int dial = INITIAL_DIAL_VALUE;
int zeroPointCounter = 0;
string[] lines = File.ReadAllLines(selectedFile);

foreach (string line in lines)
{
    char rotationType = line[0];
    string rotateString = new(line.Where(char.IsDigit).ToArray());
    int rotationAngle = int.Parse(rotateString);
    Console.WriteLine($"{rotationType} {rotationAngle}\t# {dial}");

    switch (rotationType)
    {
        case 'L':
            dial -= rotationAngle;
            break;
        case 'R':
            dial += rotationAngle;
            break;
        default:
            throw new Exception($"Unknow rotation type: {rotationType}");
    }

    dial %= DIAL_POSITIONS;

    if (dial == 0) zeroPointCounter++;
}

Console.WriteLine($"\nActual password: {zeroPointCounter}");

/*
This verison get right answer but it got negative dial:

L 68    # 50
L 30    # -18
R 48    # -48
L 5     # 0
R 60    # -5
L 55    # 55
L 1     # 0
L 99    # -1
R 14    # 0
L 82    # 14

Actual password: 3

beccause of this line: `dial %= DIAL_POSITIONS;`
`%` in C# is not modulo, it's REMAINDER!
*/