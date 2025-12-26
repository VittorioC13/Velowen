@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add api/generate-3d.ts client/src/pages/image-to-3d.tsx client/src/components/GaussianViewer.tsx
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix PLY loading - return JSON with base64, convert to blob properly"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed loading! Vercel will redeploy.

