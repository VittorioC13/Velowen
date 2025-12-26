@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Redesign homepage: minimalist zen style with search bar at top like marble"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Minimalist zen design! Vercel will redeploy.

