# SmartechBlog: Monday/Thursday from 2026-09-14, 09:00 Korea time.
# Preview: powershell -File .\setup_scheduler.ps1 -WhatIf
# Apply after reviewing the preview. Existing task XML is backed up first.
[CmdletBinding(SupportsShouldProcess = $true)]
param()

$ErrorActionPreference = 'Stop'
$pythonWindowless = 'C:\Users\rokmc\AppData\Local\Programs\Python\Python312\pythonw.exe'
$script = Join-Path $PSScriptRoot 'auto_upload.py'
$logfile = Join-Path $PSScriptRoot 'upload-log.txt'
$backupDir = Join-Path $PSScriptRoot ('scheduler-backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))

if ((Get-TimeZone).Id -ne 'Korea Standard Time') {
    throw 'Task triggers require Windows time zone Korea Standard Time. No task was changed.'
}
foreach ($required in @($pythonWindowless, $script)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required file missing: $required"
    }
}

# Hidden marks the scheduler entry; pythonw and CREATE_NO_WINDOW in Python
# prevent the console itself from opening (QuickEdit click/pause protection).
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -Hidden `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

$existing = @(Get-ScheduledTask | Where-Object {
    $_.TaskPath -eq '\' -and $_.TaskName -like 'SmartechBlog_*'
})

# Back up before any registration or disabling. Unrelated jobs are not changed.
foreach ($task in $existing) {
    if ($PSCmdlet.ShouldProcess($task.TaskName, 'Back up existing task XML')) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Export-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath |
            Set-Content -LiteralPath (Join-Path $backupDir ($task.TaskName + '.xml')) -Encoding Unicode
    }
}

$plan = @(
    @{ Name = 'SmartechBlog_Day1_Monday'; Slot = 'day1'; Day = 'Monday'; Start = '2026-09-14T09:00:00' },
    @{ Name = 'SmartechBlog_Day2_Thursday'; Slot = 'day2'; Day = 'Thursday'; Start = '2026-09-17T09:00:00' }
)

foreach ($item in $plan) {
    $action = New-ScheduledTaskAction -Execute $pythonWindowless `
        -Argument "`"$script`" --slot $($item.Slot)" -WorkingDirectory $PSScriptRoot
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $item.Day -At '09:00'
    $trigger.StartBoundary = $item.Start
    if ($PSCmdlet.ShouldProcess($item.Name, "Register hidden weekly task starting $($item.Start)")) {
        Register-ScheduledTask -TaskName $item.Name -Action $action -Trigger $trigger `
            -Settings $settings -RunLevel Highest -Force | Out-Null
        Add-Content -LiteralPath $logfile -Encoding UTF8 -Value "[$(Get-Date -Format s)] Registered $($item.Name), start=$($item.Start), backup=$backupDir"
    }
}

# Friday 09/11 awaits an explicit user upload request, so disable its automatic
# job too. auto_upload.py retains pre-transition day3 compatibility.
# Keep old definitions recoverable: disable, never delete.
foreach ($task in $existing) {
    if ($task.TaskName -match '^SmartechBlog_Day[2-5]_' -and
        $task.TaskName -ne 'SmartechBlog_Day2_Thursday') {
        if ($PSCmdlet.ShouldProcess($task.TaskName, 'Disable legacy Wednesday/Friday/temporary task')) {
            Disable-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath | Out-Null
            Add-Content -LiteralPath $logfile -Encoding UTF8 -Value "[$(Get-Date -Format s)] Disabled $($task.TaskName), backup=$backupDir"
        }
    }
}

Write-Host 'Plan: Monday day1 from 2026-09-14; Thursday day2 from 2026-09-17, 09:00 KST.'
Write-Host 'Queue and approval flags are unchanged. Friday 09/11 needs an explicit user request.'
Write-Host "Existing definitions backup (when applied): $backupDir"
Write-Host "Log: $logfile"
