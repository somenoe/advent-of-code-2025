param(
    [ValidateSet('i', 'e')]
    [string]$Mode,
    [string]$Folder = '.'
)

if (-not $Mode) {
    Write-Host "Usage: run.ps1 [i|e] [folder]"
    exit 1
}

$executable = "$Folder/main.exe"

if (-not (Test-Path $executable)) {
    Write-Host "Error: $executable not found. Run build.ps1 first."
    exit 1
}

# Run
& $executable $Mode $Folder
