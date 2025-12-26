@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Copy EXACT SHARP-ML UI - all components and page structure"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Copied EXACT SHARP-ML UI! Vercel will redeploy.

