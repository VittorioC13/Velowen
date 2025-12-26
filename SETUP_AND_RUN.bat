@echo off
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed. Make sure Node.js is installed and npm is in your PATH.
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting Velowen.art server...
echo Server will be available at http://localhost:5000
echo.
call npm run dev

