param(
    [string]$Folder = '.'
)

$executable = "$Folder/main.exe"
$source = "$Folder/main.cpp"

if (-not (Test-Path $source)) {
    Write-Host "Error: $source not found"
    exit 1
}

# Compile
Write-Host "Compiling..."
g++ -std=c++17 -o $executable $source
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed"
    exit 1
}

Write-Host "Build successful: $executable"
