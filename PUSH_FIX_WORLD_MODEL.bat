@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix: Replace 2D->3D with World Model"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed World Model title! Vercel will redeploy.

