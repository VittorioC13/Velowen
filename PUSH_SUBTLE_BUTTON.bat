@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Make button more subtle and blended"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Button is now more subtle! Vercel will redeploy.

