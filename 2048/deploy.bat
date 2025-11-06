@echo off
echo ========================================
echo House Renting System - Deployment Helper
echo ========================================
echo.

:menu
echo Choose your deployment platform:
echo.
echo 1. Vercel (Recommended for quick deploy)
echo 2. Render (Recommended for beginners)
echo 3. Railway
echo 4. Heroku
echo 5. Docker (Local)
echo 6. Docker Compose (Local with MongoDB)
echo 7. Check if dependencies are installed
echo 8. Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto render
if "%choice%"=="3" goto railway
if "%choice%"=="4" goto heroku
if "%choice%"=="5" goto docker
if "%choice%"=="6" goto docker-compose
if "%choice%"=="7" goto check-deps
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
goto menu

:vercel
echo.
echo ========================================
echo Deploying to Vercel
echo ========================================
echo.
echo Prerequisites:
echo - Vercel CLI installed (npm install -g vercel)
echo - Git repository initialized
echo - MongoDB Atlas connection string ready
echo.
pause
echo.
echo Installing dependencies...
call npm install
echo.
echo Deploying to Vercel...
call vercel
echo.
echo Deployment complete! Follow the prompts to set environment variables.
echo Don't forget to add MONGO_URI and JWT_SECRET in Vercel dashboard.
pause
goto menu

:render
echo.
echo ========================================
echo Deploying to Render
echo ========================================
echo.
echo Steps to deploy on Render:
echo 1. Push your code to GitHub
echo 2. Go to https://dashboard.render.com
echo 3. Click "New +" and select "Web Service"
echo 4. Connect your GitHub repository
echo 5. Use these settings:
echo    - Build Command: npm install
echo    - Start Command: npm start
echo 6. Add environment variables:
echo    - MONGO_URI (your MongoDB connection string)
echo    - JWT_SECRET (a secure random string)
echo    - NODE_ENV=production
echo.
echo render.yaml file is already configured for you!
echo.
pause
goto menu

:railway
echo.
echo ========================================
echo Deploying to Railway
echo ========================================
echo.
echo Prerequisites:
echo - Railway CLI installed (npm install -g @railway/cli)
echo - Git repository initialized
echo.
pause
echo.
echo Logging into Railway...
call railway login
echo.
echo Initializing Railway project...
call railway init
echo.
echo Setting environment variables...
echo Please enter your MongoDB URI:
set /p mongo_uri="MONGO_URI: "
call railway variables set MONGO_URI="%mongo_uri%"
echo.
echo Please enter your JWT secret:
set /p jwt_secret="JWT_SECRET: "
call railway variables set JWT_SECRET="%jwt_secret%"
call railway variables set NODE_ENV=production
echo.
echo Deploying to Railway...
call railway up
echo.
echo Deployment complete!
pause
goto menu

:heroku
echo.
echo ========================================
echo Deploying to Heroku
echo ========================================
echo.
echo Prerequisites:
echo - Heroku CLI installed
echo - Git repository initialized
echo.
pause
echo.
echo Logging into Heroku...
call heroku login
echo.
echo Creating Heroku app...
call heroku create house-renting-system
echo.
echo Setting environment variables...
echo Please enter your MongoDB URI:
set /p mongo_uri="MONGO_URI: "
call heroku config:set MONGO_URI="%mongo_uri%"
echo.
echo Please enter your JWT secret:
set /p jwt_secret="JWT_SECRET: "
call heroku config:set JWT_SECRET="%jwt_secret%"
call heroku config:set NODE_ENV=production
echo.
echo Deploying to Heroku...
git push heroku main
echo.
echo Opening app in browser...
call heroku open
echo.
echo Deployment complete!
pause
goto menu

:docker
echo.
echo ========================================
echo Building and Running Docker Container
echo ========================================
echo.
echo Prerequisites:
echo - Docker installed and running
echo - MongoDB Atlas connection string ready
echo.
pause
echo.
echo Building Docker image...
docker build -t house-renting-system .
echo.
echo Please enter your MongoDB URI:
set /p mongo_uri="MONGO_URI: "
echo.
echo Please enter your JWT secret:
set /p jwt_secret="JWT_SECRET: "
echo.
echo Running Docker container...
docker run -d -p 5000:5000 -e MONGO_URI="%mongo_uri%" -e JWT_SECRET="%jwt_secret%" --name house-renting-system house-renting-system
echo.
echo Container started! Access the app at http://localhost:5000
echo.
echo To view logs: docker logs house-renting-system
echo To stop: docker stop house-renting-system
echo To remove: docker rm house-renting-system
pause
goto menu

:docker-compose
echo.
echo ========================================
echo Running with Docker Compose
echo ========================================
echo.
echo Prerequisites:
echo - Docker and Docker Compose installed
echo.
echo This will start both the app and a local MongoDB instance.
echo.
pause
echo.
echo Creating .env file for Docker Compose...
echo MONGO_URI=mongodb://mongodb:27017/renthub > .env.docker
echo JWT_SECRET=your-secret-key-change-in-production >> .env.docker
echo.
echo Starting services with Docker Compose...
docker-compose --env-file .env.docker up -d
echo.
echo Services started! Access the app at http://localhost:5000
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo To stop and remove volumes: docker-compose down -v
pause
goto menu

:check-deps
echo.
echo ========================================
echo Checking Dependencies
echo ========================================
echo.
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo Node.js is NOT installed. Please install from https://nodejs.org
) else (
    echo Node.js is installed.
)
echo.
echo Checking npm...
npm --version
if errorlevel 1 (
    echo npm is NOT installed.
) else (
    echo npm is installed.
)
echo.
echo Checking Git...
git --version
if errorlevel 1 (
    echo Git is NOT installed. Install from https://git-scm.com
) else (
    echo Git is installed.
)
echo.
echo Checking Docker...
docker --version
if errorlevel 1 (
    echo Docker is NOT installed. Install from https://docker.com
) else (
    echo Docker is installed.
)
echo.
echo Checking Vercel CLI...
vercel --version
if errorlevel 1 (
    echo Vercel CLI is NOT installed. Install with: npm install -g vercel
) else (
    echo Vercel CLI is installed.
)
echo.
echo Checking Heroku CLI...
heroku --version
if errorlevel 1 (
    echo Heroku CLI is NOT installed. Install from https://devcenter.heroku.com/articles/heroku-cli
) else (
    echo Heroku CLI is installed.
)
echo.
echo Checking Railway CLI...
railway --version
if errorlevel 1 (
    echo Railway CLI is NOT installed. Install with: npm install -g @railway/cli
) else (
    echo Railway CLI is installed.
)
echo.
pause
goto menu

:end
echo.
echo Thank you for using the deployment helper!
echo For detailed instructions, see DEPLOYMENT.md
echo.
pause
exit
