# SmartechBlog 자동 업로드 — Windows 작업 스케줄러 등록
# 딱 한 번만 실행하면 됩니다.
#
# 실행 방법 (PowerShell 관리자 권한):
#   ! powershell -ExecutionPolicy Bypass -File "C:\Users\rokmc\smartech\블로그\setup_scheduler.ps1"

$python = "C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
$script = "C:\Users\rokmc\smartech\블로그\auto_upload.py"
$workdir = "C:\Users\rokmc\smartech\블로그"

# 공통 설정: 컴퓨터가 꺼져 있어도 당일 켜지면 즉시 실행
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

Write-Host "스마텍 블로그 자동 업로드 스케줄러 등록 중..."

# 월요일 — day1
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

# 수요일 — day2
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

# 금요일 — day3
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

Write-Host ""
Write-Host "✅ 등록 완료:"
Write-Host "   SmartechBlog_Day1_Monday   (월요일 09:00)"
Write-Host "   SmartechBlog_Day2_Wednesday (수요일 09:00)"
Write-Host "   SmartechBlog_Day3_Friday    (금요일 09:00)"
Write-Host ""
Write-Host "컴퓨터가 해당 시간에 꺼져 있어도, 당일 켜지면 자동 실행됩니다."
Write-Host "업로드 결과는 블로그\upload-log.txt 에서 확인할 수 있습니다."
