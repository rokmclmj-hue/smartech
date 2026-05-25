@echo off
cd /d "C:\Users\rokmc\smartech"

echo.
echo  [1단계] 통화 녹음 변환 중...
node scripts/transcribe-recordings.mjs

echo.
echo  [2단계] AI 콘텐츠 파이프라인 실행 중...
node scripts/ai-pipeline.mjs
