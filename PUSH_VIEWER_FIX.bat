@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add client/src/components/GaussianViewer.tsx
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix blob URL handling in Gaussian viewer"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed viewer! Vercel will redeploy.

