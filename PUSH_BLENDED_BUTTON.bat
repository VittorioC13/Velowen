@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Make button blend seamlessly with Velowen blue gradient"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Button now blends seamlessly! Vercel will redeploy.

