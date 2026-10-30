$ErrorActionPreference = 'Stop'
$project = 'C:\Users\jason\OneDrive\Desktop\Moonshine Capital\website build\Distilled-Marketplace'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $project, (Join-Path $project '_reference') | Out-Null
Set-Location $project
$gitIgnore = @'
node_modules/
.next/
out/
.vercel/
.env*
!.env.example
*.tsbuildinfo
.playwright-cli/
_reference/
'@
if (-not (Test-Path '.gitignore')) { Set-Content -Path '.gitignore' -Value $gitIgnore -Encoding utf8 }
foreach ($file in @('MASTER-MARKETPLACE-PROMPT.md','SOURCE-AND-OWNERSHIP.md','MARKETPLACE-CATEGORIES.json','LEGACY-WIX-SERVICES.md','CODEX-START.txt')) {
  Copy-Item -Path (Join-Path $scriptDir $file) -Destination (Join-Path $project '_reference') -Force
}
if (Get-Command git -ErrorAction SilentlyContinue) {
  if (-not (Test-Path '.git')) { & git init -b main | Out-Host }
  foreach ($repo in @('funding-distilled','distilled-solutions','distilled-industries')) {
    $dest = Join-Path (Join-Path $project '_reference') $repo
    if (-not (Test-Path $dest)) { & git clone --depth 1 "https://github.com/JFeimster/$repo.git" $dest | Out-Host }
  }
} else {
  Write-Warning 'Git not available on PATH. Install Git, reopen PowerShell and rerun script to initialize Git and clone references.'
}
if (Get-Command code -ErrorAction SilentlyContinue) { & code $project }
Write-Host "Workspace prepared: $project" -ForegroundColor Green
Write-Host 'Paste _reference/CODEX-START.txt into Codex chat; do not paste the whole master prompt.'
