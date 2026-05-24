@echo off
cd /d "C:\Users\rokmc\smartech"
echo.
echo  [스마텍] 통화 녹음 변환 시작
echo  data\녹음\ 폴더의 파일을 텍스트로 변환합니다.
echo.
node scripts/transcribe-recordings.mjs
pause
