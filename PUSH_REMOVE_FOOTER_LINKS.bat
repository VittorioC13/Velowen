@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Remove Paper, Project, GitHub links from footer"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Removed footer links! Vercel will redeploy.

