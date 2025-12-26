@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Copy EXACT SHARP-ML viewer code with logging"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Copied EXACT SHARP-ML viewer! Check browser console for errors. Vercel will redeploy.

