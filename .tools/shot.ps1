param(
  [string]$Name,
  [string]$HashPath = "#/",
  [int]$Width = 1440,
  [int]$Height = 1800,
  [int]$Scale = 1,
  [int]$Budget = 5000
)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$out = Join-Path $env:TEMP "coevo-shots"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$profile = Join-Path $env:TEMP "coevo-profile-$Name"
$shot = Join-Path $out "$Name.png"
if (Test-Path $shot) { Remove-Item $shot -Force }
$args = @(
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--hide-scrollbars",
  "--force-device-scale-factor=$Scale",
  "--user-data-dir=$profile",
  "--window-size=$Width,$Height",
  "--screenshot=$shot",
  "--virtual-time-budget=$Budget",
  "http://127.0.0.1:4173/$HashPath"
)
$p = Start-Process -FilePath $edge -ArgumentList $args -PassThru -NoNewWindow
$done = $p.WaitForExit(60000)
if (-not $done) { Stop-Process -Id $p.Id -Force; Write-Output "TIMEOUT $Name"; exit 2 }
if (Test-Path $shot) {
  Write-Output "OK $Name $((Get-Item $shot).Length)"
} else {
  Write-Output "MISSING $Name"
  exit 1
}
