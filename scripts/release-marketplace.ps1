<#
Marketplace release: validate, commit scoped changes, push a release branch,
create a PR, and opt in to CI-gated squash merge. Does not force-push or deploy directly.
Requires Git, Node/npm, and authenticated GitHub CLI (gh).
Pass exact repository-relative paths through -Files plus release metadata and notes.
Use -NoAutoSquash to keep the PR open after CI.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string[]]$Files,
  [Parameter(Mandatory)][string]$ReleaseTitle,
  [Parameter(Mandatory)][string]$CommitMessage,
  [Parameter(Mandatory)][string[]]$ReleaseNotes,
  [switch]$NoAutoSquash
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-Checked {
  param([string]$Command, [string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE)." }
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $root
try {
  foreach ($cmd in @('git', 'npm', 'gh')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
      throw "Missing required command '$cmd'. Install it before releasing."
    }
  }

  $remote = (& git remote get-url origin).Trim()
  if ($LASTEXITCODE -ne 0 -or $remote -notmatch 'github[.]com[:/]JFeimster/Distilled-Marketplace([.]git)?$') {
    throw "Unexpected origin remote: $remote"
  }
  $branch = (& git branch --show-current).Trim()
  if ($branch -ne 'main') {
    throw "Current branch is '$branch'. Release from main to avoid mixing unrelated work."
  }
  Invoke-Checked 'gh' @('auth', 'status')

  Write-Host 'Running existing project checks before staging...' -ForegroundColor Cyan
  Invoke-Checked 'npm' @('run', 'check')

  $alreadyStaged = @(& git diff --cached --name-only)
  if ($alreadyStaged.Count) { throw "Pre-existing staged changes found: $($alreadyStaged -join ', '). Review them before release." }

  if (-not $Files.Count) { throw 'Pass the exact release scope through -Files.' }
  $allow = @($Files | ForEach-Object {
    $path = $_.Replace('\', '/')
    if ([IO.Path]::IsPathRooted($path) -or $path -match '(^|/)\.\.(?:/|$)') { throw "Release path must stay inside the repository: $_" }
    if (-not (Test-Path -LiteralPath $_)) { throw "Release path does not exist: $_" }
    $path
  } | Sort-Object -Unique)
  if ($allow.Count -ne $Files.Count) { throw 'Release file manifest contains duplicate paths.' }
  Invoke-Checked 'git' (@('add', '-A', '--') + @($allow | ForEach-Object { ":(literal)$_" }))

  $staged = @(& git diff --cached --name-only)
  if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect staged changes.' }
  if ($staged.Count -eq 0) { throw 'No changes staged; nothing to release.' }
  $allowedPaths = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  foreach ($file in $allow) { [void]$allowedPaths.Add($file) }
  foreach ($file in $staged) {
    if (-not $allowedPaths.Contains($file)) { throw "Unapproved staged path: $file" }
  }

  $forbidden = @('(^|/)(_reference|output|node_modules|\.next|\.vercel)/', '(^|/)\.env', '\.(pem|key|p12|pfx)$', 'credential|service[_-]?role|secret|token')
  foreach ($file in $staged) {
    foreach ($pattern in $forbidden) {
      if ($file -match $pattern) { throw "Potentially sensitive staged path: $file" }
    }
  }

  Write-Host "Staged $($staged.Count) project files:" -ForegroundColor Cyan
  $staged | ForEach-Object { Write-Host "  $_" }

  $remaining = @(& git diff --name-only)
  $untracked = @(& git ls-files --others --exclude-standard)
  if ($remaining.Count) {
    Write-Warning "There are tracked changes not included in this release: $($remaining -join ', ')"
  }
  if ($untracked.Count) {
    Write-Warning "There are other untracked files not staged: $($untracked -join ', ')"
  }
  Invoke-Checked 'git' @('diff', '--cached', '--check')

  $releaseBranch = 'release/marketplace-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
  Invoke-Checked 'git' @('switch', '-c', $releaseBranch)
  Invoke-Checked 'git' @('commit', '-m', $CommitMessage)
  Invoke-Checked 'git' @('push', '-u', 'origin', $releaseBranch)

  $notes = $ReleaseNotes | ForEach-Object { "- $_" }
  $body = @"
## $ReleaseTitle
$($notes -join "`n")
- Preserve noindex, X-Robots-Tag, and the empty staging sitemap.
- Local validation: npm run check passed.

CI must pass before the existing workflow squash-merges this PR. Vercel deploys when main updates.
"@
  Invoke-Checked 'gh' @('pr', 'create', '--base', 'main', '--head', $releaseBranch,
    '--title', $ReleaseTitle, '--body', $body)

  if (-not $NoAutoSquash) {
    # The workflow only performs the squash after its own check job is green.
    Invoke-Checked 'gh' @('label', 'create', 'auto-squash',
      '--description', 'Opt-in: squash merge after Marketplace CI passes',
      '--color', '157347', '--force')
    Invoke-Checked 'gh' @('pr', 'edit', $releaseBranch, '--add-label', 'auto-squash')
    Write-Host 'CI-gated auto-squash requested. Vercel deploys when main updates.' -ForegroundColor Green
  } else {
    Write-Host 'PR opened for review. Auto-squash not requested.' -ForegroundColor Yellow
  }
  Invoke-Checked 'gh' @('pr', 'view', $releaseBranch, '--json', 'url', '--jq', '.url')
} finally {
  Pop-Location
}
