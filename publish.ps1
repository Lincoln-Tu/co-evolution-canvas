# ============================================================
#  共演战略画布 · 一键发布到 GitHub Pages
#  用法：
#    pwsh -ExecutionPolicy Bypass -File .\publish.ps1
#    pwsh -ExecutionPolicy Bypass -File .\publish.ps1 -Repo my-repo
#
#  前置条件：
#    1) 已安装 GitHub CLI（gh）并完成登录：gh auth login
#    2) 本机有 git（脚本会自动搜索常见位置）
# ============================================================
param(
  [string]$Repo = "co-evolution-canvas",
  [string]$Branch = "main",
  [switch]$Private
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

function Find-Exe([string]$name, [string[]]$candidates) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$git = Find-Exe "git" @(
  "$env:LOCALAPPDATA\dsh-tools\git\cmd\git.exe",
  "$env:ProgramFiles\Git\cmd\git.exe",
  "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
  "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
)
$gh = Find-Exe "gh" @(
  "$env:ProgramFiles\GitHub CLI\gh.exe",
  "$env:LOCALAPPDATA\GitHubCLI\gh.exe"
)

if (-not $git) { throw "未找到 git。请先安装 Git for Windows。" }
if (-not $gh) { throw "未找到 gh。请先安装 GitHub CLI。" }

Write-Host "`n==> 检查 GitHub 登录状态" -ForegroundColor Cyan
& $gh auth status 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "尚未登录 GitHub。请先在终端运行：gh auth login --hostname github.com --git-protocol https --web"
}

$login = (& $gh api user --jq .login).Trim()
$owner = (& $gh api user --jq .login).Trim()
Write-Host "登录用户：$login" -ForegroundColor Green

# 保持提交身份与账号一致（仅本仓库）
& $git config user.name $login
& $git config user.email "$login@users.noreply.github.com"

Write-Host "`n==> 检查仓库是否存在" -ForegroundColor Cyan
& $gh repo view "$login/$Repo" --json name 1>$null 2>$null
$repoExists = ($LASTEXITCODE -eq 0)

if (-not $repoExists) {
  $visibility = if ($Private) { "--private" } else { "--public" }
  Write-Host "创建仓库 $login/$Repo（$visibility）" -ForegroundColor Yellow
  & $gh repo create "$Repo" $visibility --source . --remote origin --description "共演战略画布 · 基于路江涌教授方法论的 EMBA 交互式战略推演工具"
} else {
  Write-Host "仓库已存在，复用" -ForegroundColor Yellow
  & $git remote get-url origin 1>$null 2>$null
  if ($LASTEXITCODE -ne 0) {
    & $git remote add origin "https://github.com/$login/$Repo.git"
  }
}

Write-Host "`n==> 提交并推送" -ForegroundColor Cyan
& $git add -A
& $git commit -m "feat: 共演战略画布 v1.0 · 四要素 × 四阶段交互推演" 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "没有新的变更需要提交" -ForegroundColor DarkGray }
& $git branch -M $Branch
& $git push -u origin $Branch

Write-Host "`n==> 开启 GitHub Pages" -ForegroundColor Cyan
try {
  & $gh api -X POST "repos/$login/$Repo/pages" -f "source[branch]=$Branch" -f "source[path]=/" 1>$null 2>$null
  if ($LASTEXITCODE -ne 0) {
    # 已存在则更新
    & $gh api -X PUT "repos/$login/$Repo/pages" -f "source[branch]=$Branch" -f "source[path]=/" 1>$null 2>$null
  }
} catch {
  Write-Host "Pages 开启失败（可能已开启或需要手动在 Settings → Pages 中设置）" -ForegroundColor Yellow
}

$url = "https://$login.github.io/$Repo/"
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  发布完成" -ForegroundColor Green
Write-Host "  仓库：https://github.com/$login/$Repo"
Write-Host "  站点：$url"
Write-Host "  （首次部署约需 1–2 分钟生效）"
Write-Host "============================================`n" -ForegroundColor Green
