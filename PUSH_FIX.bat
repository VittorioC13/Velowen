@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix Vercel deployment - add serverless function"
"C:\Program Files\Git\cmd\git.exe" push origin main
pause

