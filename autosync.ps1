# ============================================================
#  共演战略画布 · 本地修改自动同步到 GitHub
#
#  用法：
#    .\autosync.ps1 -Once        # 立即同步一次
#    .\autosync.ps1 -Watch       # 前台守护：监听文件变化，自动同步
#    .\autosync.ps1 -Install     # 注册开机自启（登录后静默运行）
#    .\autosync.ps1 -Uninstall   # 取消开机自启
#    .\autosync.ps1 -Status      # 查看待同步差异
#
#  说明：
#    - 同步走 api.github.com（GitHub REST API），不依赖 github.com:443，
#      因此在 github.com 被间歇阻断的网络下依然可用。
#    - 首次发布使用 .tools/publish.mjs；令牌保存在 %USERPROFILE%\.coevo\token。
#    - 日志：%USERPROFILE%\.coevo\sync.log
# ============================================================
param(
  [switch]$Once,
  [switch]$Watch,
  [switch]$Install,
  [switch]$Uninstall,
  [switch]$Status
)

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$StateDir = Join-Path $env:USERPROFILE ".coevo"
$TaskName = "CoEvoCanvasAutoSync"
$Script = Join-Path $RepoDir ".tools\sync.mjs"

function Find-Node {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in @("$env:ProgramFiles\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe")) {
    if (Test-Path $c) { return $c }
  }
  return $null
}
$Node = Find-Node

function Ensure-Ready {
  if (-not $Node) { throw "未找到 Node.js，请先安装 Node.js 18+。" }
  if (-not (Test-Path $Script)) { throw "缺少 $Script" }
  if (-not (Test-Path (Join-Path $StateDir "token"))) {
    throw "缺少授权令牌：$StateDir\token。请先运行 .tools/publish.mjs 完成首次发布。"
  }
}

function Invoke-Once {
  Ensure-Ready
  Push-Location $RepoDir
  try { & $Node $Script } finally { Pop-Location }
}

function Invoke-Status {
  Ensure-Ready
  Push-Location $RepoDir
  try { & $Node $Script --status } finally { Pop-Location }
}

function Install-AutoStart {
  Ensure-Ready
  $nodeArgs = "`"$Script`" --watch"
  try {
    $action = New-ScheduledTaskAction -Execute $Node -Argument $nodeArgs -WorkingDirectory $RepoDir
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "共演战略画布：本地修改自动同步到 GitHub" -Force | Out-Null
    Write-Host "✓ 已注册开机自启：$TaskName" -ForegroundColor Green
  } catch {
    $startup = [Environment]::GetFolderPath("Startup")
    $vbs = Join-Path $startup "CoEvoCanvasAutoSync.vbs"
    $cmd = "@echo off`r`n`"$Node`" `"$Script`" --watch"
    $cmdPath = Join-Path $startup "CoEvoCanvasAutoSync.cmd"
    $cmd | Out-File -FilePath $cmdPath -Encoding ASCII
    Write-Host "✓ 已通过启动文件夹安装自启：$cmdPath" -ForegroundColor Green
  }
  Write-Host "  立即生效请运行：.\autosync.ps1 -Watch" -ForegroundColor Cyan
}

function Uninstall-AutoStart {
  try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
    Write-Host "✓ 已移除计划任务" -ForegroundColor Green
  } catch {
    Write-Host "计划任务不存在（或已移除）" -ForegroundColor DarkGray
  }
  $startup = [Environment]::GetFolderPath("Startup")
  foreach ($f in @("CoEvoCanvasAutoSync.cmd", "CoEvoCanvasAutoSync.vbs")) {
    $p = Join-Path $startup $f
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "✓ 已移除启动项 $f" -ForegroundColor Green }
  }
}

if ($Uninstall) { Uninstall-AutoStart; exit 0 }
if ($Install) { Install-AutoStart; exit 0 }
if ($Status) { Invoke-Status; exit 0 }
if ($Once) { Invoke-Once; exit 0 }
if ($Watch) { Ensure-Ready; Set-Location $RepoDir; & $Node $Script --watch; exit 0 }

Write-Host @"
共演战略画布 · 自动同步

  .\autosync.ps1 -Once        立即同步一次
  .\autosync.ps1 -Status      查看待同步差异
  .\autosync.ps1 -Watch       前台监听并自动同步
  .\autosync.ps1 -Install     注册开机自启（后台静默）
  .\autosync.ps1 -Uninstall   取消开机自启
"@ -ForegroundColor Cyan
