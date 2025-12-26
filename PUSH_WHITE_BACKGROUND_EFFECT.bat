@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Add white background progressive reveal effect like SHARP-ML"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Added white background progressive reveal effect! Vercel will redeploy.

