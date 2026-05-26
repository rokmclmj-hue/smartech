@echo off
cd /d "C:\Users\rokmc\smartech"
echo [Step 1] Transcribing recordings...
node scripts/transcribe-recordings.mjs
echo [Step 2] Running AI pipeline...
node scripts/ai-pipeline.mjs
pause
