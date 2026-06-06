# SmartechBlog Auto Upload - Windows Task Scheduler Setup
# Run once only.
# How to run: ! powershell -ExecutionPolicy Bypass -File "C:\Users\rokmc\smartech\블로그\setup_scheduler.ps1"

$python = "C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
$script = "C:\Users\rokmc\smartech\블로그\auto_upload.py"
$workdir = "C:\Users\rokmc\smartech\블로그"
$logfile = "C:\Users\rokmc\smartech\블로그\upload-log.txt"

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

# Monday - day1
$action1 = New-ScheduledTaskAction `
    -Execute $python `
    -Argument "`"$script`" --slot day1" `
    -WorkingDirectory $workdir
$trigger1 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "09:00"
Register-ScheduledTask `
    -TaskName "SmartechBlog_Day1_Monday" `
    -Action $action1 `
    -Trigger $trigger1 `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

# Wednesday - day2
$action2 = New-ScheduledTaskAction `
    -Execute $python `
    -Argument "`"$script`" --slot day2" `
    -WorkingDirectory $workdir
$trigger2 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Wednesday -At "09:00"
Register-ScheduledTask `
    -TaskName "SmartechBlog_Day2_Wednesday" `
    -Action $action2 `
    -Trigger $trigger2 `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

# Friday - day3
$action3 = New-ScheduledTaskAction `
    -Execute $python `
    -Argument "`"$script`" --slot day3" `
    -WorkingDirectory $workdir
$trigger3 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At "09:00"
Register-ScheduledTask `
    -TaskName "SmartechBlog_Day3_Friday" `
    -Action $action3 `
    -Trigger $trigger3 `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

Write-Host "Done:"
Write-Host "  SmartechBlog_Day1_Monday    (Mon 09:00)"
Write-Host "  SmartechBlog_Day2_Wednesday (Wed 09:00)"
Write-Host "  SmartechBlog_Day3_Friday    (Fri 09:00)"
Write-Host "Log: $logfile"
