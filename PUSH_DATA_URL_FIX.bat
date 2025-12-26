@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add client/src/pages/image-to-3d.tsx
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix PLY loading - use data URL instead of blob URL"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed! Using data URL now. Vercel will redeploy.

