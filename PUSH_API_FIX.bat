@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add api/generate-3d.ts
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix Modal API response format - use ply_base64"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed! Vercel will redeploy.

