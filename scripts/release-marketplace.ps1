<#
Marketplace release: validate, commit scoped changes, push a release branch,
create a PR, and opt in to CI-gated squash merge. Does not force-push or deploy directly.
Requires Git, Node/npm, and authenticated GitHub CLI (gh).
Run from any directory: pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\release-marketplace.ps1
Use -NoAutoSquash to keep the PR open after CI.
#>
[CmdletBinding()]
param([switch]$NoAutoSquash)

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

  # Intentionally omit _reference/, output/, local reports, .env*, and arbitrary files.
  $allow = @(
    '.github', '.gitignore', 'README.md', 'AGENTS.md',
    'app', 'components', 'lib', 'schemas', 'scripts', 'tests', 'public',
    'data/marketplace', 'docs',
    'package.json', 'package-lock.json', 'next.config.ts',
    'tsconfig.json', 'eslint.config.mjs',
    'CANONICAL-SITEMAP.txt', 'PROVIDER-V3-BUILD-REPORT.md'
  )
  $existing = @($allow | Where-Object { Test-Path -LiteralPath $_ })
  if ($existing.Count -eq 0) { throw 'No recognized project paths available to stage.' }
  Invoke-Checked 'git' (@('add', '-A', '--') + $existing)

  $staged = @(& git diff --cached --name-only)
  if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect staged changes.' }
  if ($staged.Count -eq 0) { throw 'No changes staged; nothing to release.' }

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
  Invoke-Checked 'git' @('commit', '-m', 'feat: publish owner-approved marketplace provider inventory')
  Invoke-Checked 'git' @('push', '-u', 'origin', $releaseBranch)

  $body = @'
## Marketplace provider publication
- Publish owner-approved provider listings from local v3 implementation.
- Preserve 52 saved referral destinations; 102 company website primaries.
- Preserve noindex and empty sitemap.
- Validation: npm run check passed locally.

CI must pass before merging. No live redirect crawl or redundant affiliate reverification gate.
'@
  Invoke-Checked 'gh' @('pr', 'create', '--base', 'main', '--head', $releaseBranch,
    '--title', 'feat: activate 154 Marketplace provider listings', '--body', $body)

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
  Invoke-Checked 'gh' @('pr', 'view', $releaseBranch, '--web')
} finally {
  Pop-Location
}
