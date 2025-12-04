const string EXAMPLE_FILE_PATH = "example.txt";
const string INPUT_FILE_PATH = "input.txt";

string selectedFile = EXAMPLE_FILE_PATH;
if (args.Length > 0 && args[0] == "i") selectedFile = INPUT_FILE_PATH;

string[] lines = File.ReadAllLines(selectedFile);
char[][] diagram = lines.Select(line => line.ToCharArray()).ToArray();

int accessiblePaperRollCounter = 0;
const char PAPER_ROLL_SYMBOL = '@';

for (int row = 0; row < diagram.Length; row++)
{
    for (int column = 0; column < diagram[row].Length; column++)
    {
        if (diagram[row][column] != PAPER_ROLL_SYMBOL)
        {
            Console.Write("_");
            continue;
        }

        int adjacentPaperRollCounter = 0;
        bool isFirstRow = 0 == row;
        bool isFirstColumn = 0 == column;
        bool isLastRow = diagram.Length - 1 == row;
        bool isLastColumn = diagram[row].Length - 1 == column;

        if (!isFirstRow && !isFirstColumn && diagram[row - 1][column - 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;
        if (!isFirstRow && diagram[row - 1][column] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;
        if (!isFirstRow && !isLastColumn && diagram[row - 1][column + 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;

        if (!isFirstColumn && diagram[row][column - 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;
        if (!isLastColumn && diagram[row][column + 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;

        if (!isLastRow && !isFirstColumn && diagram[row + 1][column - 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;
        if (!isLastRow && diagram[row + 1][column] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;
        if (!isLastRow && !isLastColumn && diagram[row + 1][column + 1] == PAPER_ROLL_SYMBOL) adjacentPaperRollCounter++;

        if (adjacentPaperRollCounter < 4) accessiblePaperRollCounter++;

        Console.Write(adjacentPaperRollCounter);
    }
    Console.WriteLine();
}

Console.WriteLine($"\nAccessible Paper Rolls: {accessiblePaperRollCounter}");
