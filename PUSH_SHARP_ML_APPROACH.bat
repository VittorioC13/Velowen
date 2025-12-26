@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Copy SHARP-ML approach - use Vercel Blob or data URL"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Copied SHARP-ML's exact approach! Vercel will redeploy.

