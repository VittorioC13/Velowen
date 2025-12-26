@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Make button blend better with Velowen aesthetic"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Button now blends better! Vercel will redeploy.

