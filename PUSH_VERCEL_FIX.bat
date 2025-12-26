@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add package.json
"C:\Program Files\Git\cmd\git.exe" commit -m "Add Vercel node dependency"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Done! Vercel will redeploy.

