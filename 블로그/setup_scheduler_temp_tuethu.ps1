# SmartechBlog - 2026-08-25(화)/08-27(목) 임시 1회성 업로드 작업 등록
# 관리자 권한 PowerShell에서 실행 필요 (마우스 오른쪽 클릭 -> 관리자 권한으로 실행)
# 실행 후: powershell -ExecutionPolicy Bypass -File "C:\Users\rokmc\smartech\블로그\setup_scheduler_temp_tuethu.ps1"
# 1회성 작업이라 실행 후 자동으로 사라짐 (별도 정리 불필요)

$python = "C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
$script = "C:\Users\rokmc\smartech\블로그\auto_upload.py"
$workdir = "C:\Users\rokmc\smartech\블로그"

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

$action4 = New-ScheduledTaskAction -Execute $python -Argument "`"$script`" --slot day4" -WorkingDirectory $workdir
$trigger4 = New-ScheduledTaskTrigger -Once -At "2026-08-25 09:00:00"
Register-ScheduledTask -TaskName "SmartechBlog_Day4_Tue_20260825_OneTime" -Action $action4 -Trigger $trigger4 -Settings $settings -RunLevel Highest -Force | Out-Null

$action5 = New-ScheduledTaskAction -Execute $python -Argument "`"$script`" --slot day5" -WorkingDirectory $workdir
$trigger5 = New-ScheduledTaskTrigger -Once -At "2026-08-27 09:00:00"
Register-ScheduledTask -TaskName "SmartechBlog_Day5_Thu_20260827_OneTime" -Action $action5 -Trigger $trigger5 -Settings $settings -RunLevel Highest -Force | Out-Null

Write-Host "완료: 8/25(화) 09:00, 8/27(목) 09:00 1회성 작업 등록됨"
