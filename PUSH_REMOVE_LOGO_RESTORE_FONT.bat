@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Remove logo and restore original VELOWEN bold font"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Logo removed and original font restored! Vercel will redeploy.

