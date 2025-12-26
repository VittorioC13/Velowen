@echo off
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix memory crash - require Vercel Blob storage for PLY files"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Fixed! Now requires Vercel Blob storage. See SETUP_BLOB_STORAGE.md for instructions.

