@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix PLY viewer - serve via HTTP endpoint instead of data URL"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed PLY serving! Viewer should work now. Vercel will redeploy.

