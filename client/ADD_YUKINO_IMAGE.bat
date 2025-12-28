@echo off
echo ========================================
echo Add Yukino Image to Demo
echo ========================================
echo.
echo Please drag and drop your Yukino image file here, then press Enter.
echo Or type the full path to your Yukino image file:
set /p IMAGE_PATH="Image path: "

if exist "%IMAGE_PATH%" (
    echo.
    echo Copying image...
    copy "%IMAGE_PATH%" "public\demo\yukino.jpg"
    echo.
    echo Done! The Yukino image has been added.
    echo Refresh your browser to see it.
) else (
    echo.
    echo ERROR: File not found: %IMAGE_PATH%
    echo Please check the path and try again.
)

pause



