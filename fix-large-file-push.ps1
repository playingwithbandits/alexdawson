# Remove cache/racedays/2026-02-20.json from git history so push succeeds.
# Run this from the repo root in PowerShell (e.g. .\fix-large-file-push.ps1)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "1. Resetting to origin/main (keeping all changes staged)..."
git reset --soft origin/main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "2. Unstaging cache/ so it won't be in the new commit..."
git reset HEAD cache/
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "3. Committing without the large cache file..."
git commit -m "Updates (cache excluded via .gitignore)"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "4. Pushing to origin main..."
git push origin main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. You can delete this script: Remove-Item fix-large-file-push.ps1"
