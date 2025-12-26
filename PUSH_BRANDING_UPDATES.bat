@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Update branding: Remove email form, change button to 'Imagine a world...', update page titles"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Updated branding! Vercel will redeploy.

