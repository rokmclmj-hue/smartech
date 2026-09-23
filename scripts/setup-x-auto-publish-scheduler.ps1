# SmartechXAutoPublish: 승인된 X 글 중 가장 오래된 1건을 매일 11:00(한국시간)에 자동 게시.
# 미리보기: powershell -File .\scripts\setup-x-auto-publish-scheduler.ps1 -WhatIf
# 미리보기 확인 후 실행. 기존 동일 이름 작업이 있으면 먼저 XML로 백업한다.
[CmdletBinding(SupportsShouldProcess = $true)]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot 'run-x-auto-publish.bat'
$logfile = Join-Path $projectRoot 'x-auto-publish.log'
$backupDir = Join-Path $PSScriptRoot ('scheduler-backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
$taskName = 'SmartechXAutoPublish_Daily'

if ((Get-TimeZone).Id -ne 'Korea Standard Time') {
    throw '작업 트리거는 Windows 시간대가 Korea Standard Time이어야 합니다. 아무 작업도 변경하지 않았습니다.'
}
if (-not (Test-Path -LiteralPath $script -PathType Leaf)) {
    throw "필요한 파일이 없습니다: $script"
}

# Hidden은 스케줄러 항목 표시를 숨기고, .bat이 콘솔 창을 띄우지 않도록 한다
# (QuickEdit 모드 클릭 시 멈추는 문제 재발 방지 — 블로그 자동화와 동일 패턴).
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -Hidden `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -MultipleInstances IgnoreNew

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    if ($PSCmdlet.ShouldProcess($taskName, '기존 작업 XML 백업')) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Export-ScheduledTask -TaskName $existing.TaskName -TaskPath $existing.TaskPath |
            Set-Content -LiteralPath (Join-Path $backupDir ($taskName + '.xml')) -Encoding Unicode
    }
}

$action = New-ScheduledTaskAction -Execute $script -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At '11:00'

if ($PSCmdlet.ShouldProcess($taskName, '매일 11:00 숨김 작업 등록')) {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
        -Settings $settings -RunLevel Highest -Force | Out-Null
    Add-Content -LiteralPath $logfile -Encoding UTF8 -Value "[$(Get-Date -Format s)] Registered $taskName, daily 11:00, backup=$backupDir"
}

Write-Host '계획: 매일 11:00(한국시간)에 승인된 X 글 1건 자동 게시.'
Write-Host '컴퓨터가 11:00에 꺼져 있었다면(StartWhenAvailable) 다음에 켜졌을 때 놓친 실행을 자동으로 따라잡습니다. 완전히 끄지 않는 날이 있으면 기록을 확인하세요.'
Write-Host "로그: $logfile"
