# Offline scheduler contract test: every scheduler/write command is mocked.
$ErrorActionPreference = 'Stop'
$events = [System.Collections.Generic.List[object]]::new()

function Get-TimeZone { [pscustomobject]@{ Id = 'Korea Standard Time' } }
function Test-Path { param($LiteralPath, $PathType) $true }
function Get-ScheduledTask {
    foreach ($name in @('SmartechBlog_Day1_Monday', 'SmartechBlog_Day2_Wednesday',
        'SmartechBlog_Day3_Friday', 'SmartechBlog_Day4_Tue_20260825_OneTime',
        'SmartechBlog_Day5_Thu_20260827_OneTime', 'Unrelated_Task')) {
        [pscustomobject]@{ TaskPath = '\'; TaskName = $name }
    }
}
function New-ScheduledTaskSettingsSet {
    param([switch]$StartWhenAvailable, [switch]$Hidden, [switch]$RunOnlyIfNetworkAvailable,
        $ExecutionTimeLimit, $MultipleInstances)
    [pscustomobject]@{ Hidden = $Hidden.IsPresent; MultipleInstances = $MultipleInstances }
}
function New-ScheduledTaskAction {
    param($Execute, $Argument, $WorkingDirectory)
    [pscustomobject]@{ Execute = $Execute; Argument = $Argument }
}
function New-ScheduledTaskTrigger {
    param([switch]$Weekly, $DaysOfWeek, $At)
    [pscustomobject]@{ Day = $DaysOfWeek; At = $At; StartBoundary = '' }
}
function Register-ScheduledTask {
    param($TaskName, $Action, $Trigger, $Settings, $RunLevel, [switch]$Force)
    $events.Add([pscustomobject]@{ Kind = 'register'; Name = $TaskName;
        Action = $Action; Trigger = $Trigger; Settings = $Settings })
}
function Disable-ScheduledTask {
    param($TaskName, $TaskPath)
    $events.Add([pscustomobject]@{ Kind = 'disable'; Name = $TaskName })
}
function New-Item { param($ItemType, $Path, [switch]$Force) }
function Export-ScheduledTask {
    param($TaskName, $TaskPath)
    $events.Add([pscustomobject]@{ Kind = 'backup'; Name = $TaskName })
    '<mock-task/>'
}
function Set-Content {
    param($LiteralPath, $Encoding, [Parameter(ValueFromPipeline)]$Value)
    process { }
}
function Add-Content { param($LiteralPath, $Encoding, $Value) }

& (Join-Path $PSScriptRoot 'setup_scheduler.ps1') -WhatIf
if ($events.Count -ne 0) { throw 'WhatIf performed a mutation.' }

& (Join-Path $PSScriptRoot 'setup_scheduler.ps1')
$backups = @($events | Where-Object Kind -eq 'backup')
$registered = @($events | Where-Object Kind -eq 'register')
$disabled = @($events | Where-Object Kind -eq 'disable')
if ($backups.Count -ne 5 -or $registered.Count -ne 2 -or $disabled.Count -ne 4) {
    throw 'Unexpected backup/register/disable counts.'
}
if (@($events | Select-Object -First 5 | Where-Object Kind -ne 'backup').Count) {
    throw 'Task changed before every backup was complete.'
}
$expected = @('2026-09-14T09:00:00', '2026-09-17T09:00:00')
for ($index = 0; $index -lt 2; $index++) {
    $job = $registered[$index]
    if ($job.Trigger.StartBoundary -ne $expected[$index] -or
        $job.Trigger.At -ne '09:00' -or -not $job.Settings.Hidden -or
        $job.Action.Execute -notlike '*\pythonw.exe' -or
        $job.Action.Argument -notlike "*--slot day$($index + 1)") {
        throw 'Wrong schedule, slot, or console protection.'
    }
}
if ($registered[0].Trigger.Day -ne 'Monday' -or $registered[1].Trigger.Day -ne 'Thursday') {
    throw 'Wrong weekdays.'
}
if (@($events | Where-Object Name -eq 'Unrelated_Task').Count) {
    throw 'Unrelated task changed.'
}
Write-Output 'PASS: WhatIf read-only; 5 backups before changes; 2 hidden Mon/Thu tasks; 4 legacy tasks disabled; unrelated task preserved.'
