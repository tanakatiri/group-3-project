@echo off
echo ========================================
echo MongoDB Connection Setup
echo ========================================
echo.

REM Check if MongoDB service is running
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB service is running
) else (
    echo [!] MongoDB service is not running
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start MongoDB service
        echo Please run this script as Administrator
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Configuring .env file...
echo ========================================

REM Create or update .env file
(
echo MONGO_URI=mongodb://localhost:27017/renthub
echo PORT=5000
echo JWT_SECRET=renthub-secret-key-change-in-production-2024
echo NODE_ENV=development
) > .env

echo [OK] .env file configured successfully
echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo MongoDB Connection: mongodb://localhost:27017/renthub
echo Server Port: 5000
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Run: npm start
echo 3. Open: http://localhost:5000
echo.
pause
