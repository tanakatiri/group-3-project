@echo off
echo ========================================
echo Starting RentHub Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if Node.js is installed...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting server...
echo.
echo ========================================
echo Server will start on: http://localhost:5000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
