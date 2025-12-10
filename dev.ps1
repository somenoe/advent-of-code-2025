param(
    [ValidateSet('i', 'e')]
    [string]$Mode = 'e',
    [string]$Folder = '.'
)

# Build
Write-Host "Building..."
& ./build.ps1 $Folder
if ($LASTEXITCODE -ne 0) {
    exit 1
}

# Run
Write-Host "`nRunning..."
& ./run.ps1 $Mode $Folder
