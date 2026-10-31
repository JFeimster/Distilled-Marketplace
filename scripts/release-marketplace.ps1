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

  $alreadyStaged = @(& git diff --cached --name-only)
  if ($alreadyStaged.Count) { throw "Pre-existing staged changes found: $($alreadyStaged -join ', '). Review them before release." }

  # Stage only the V4.3 implementation. BUILD-REPORT.md and other local work remain unstaged.
  $allow = @(
    'app/compatibility/page.tsx', 'app/workflow-lab.css', 'app/workflows/[slug]/page.tsx',
    'components/ActionPackBuilder.tsx', 'components/CompatibilityWorkspace.tsx',
    'components/WorkflowCard.tsx', 'components/WorkflowExplorer.tsx',
    'lib/workflow-action-pack.ts', 'lib/workflow-discovery.ts', 'lib/workflows.ts',
    'scripts/release-marketplace.ps1',
    'tests/workflow-action-pack.test.ts', 'tests/workflow-lab.test.ts'
  )
  $existing = @($allow | Where-Object { Test-Path -LiteralPath $_ })
  if ($existing.Count -eq 0) { throw 'No recognized project paths available to stage.' }
  Invoke-Checked 'git' (@('add', '-A', '--') + @($existing | ForEach-Object { ":(literal)$_" }))

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
  Invoke-Checked 'git' @('commit', '-m', 'feat: add Workflow Lab action packs and guided discovery')
  Invoke-Checked 'git' @('push', '-u', 'origin', $releaseBranch)

  $body = @'
## Marketplace Workflow Lab V4.3
- Add a client-side action pack builder with live preview, copy, Markdown download, and reset to every existing blueprint.
- Improve stack coverage with catalog-derived presets, provider groups, and linked gaps; add outcome-based finder filters and related-blueprint relevance.
- Preserve the 20 editorial blueprints, 154 provider records, and all 52 saved affiliate-primary destinations.
- Preserve noindex, X-Robots-Tag, and empty staging sitemap.
- Validation: npm run check passed locally.

CI must pass before the existing workflow squash-merges this PR. Vercel deploys from main.
'@
  Invoke-Checked 'gh' @('pr', 'create', '--base', 'main', '--head', $releaseBranch,
    '--title', 'feat: add V4.3 Workflow Lab action packs', '--body', $body)

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
