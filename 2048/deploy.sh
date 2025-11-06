#!/bin/bash

# House Renting System - Deployment Helper Script
# For Linux/Mac users

echo "========================================"
echo "House Renting System - Deployment Helper"
echo "========================================"
echo ""

show_menu() {
    echo "Choose your deployment platform:"
    echo ""
    echo "1. Vercel (Recommended for quick deploy)"
    echo "2. Render (Recommended for beginners)"
    echo "3. Railway"
    echo "4. Heroku"
    echo "5. Docker (Local)"
    echo "6. Docker Compose (Local with MongoDB)"
    echo "7. Check if dependencies are installed"
    echo "8. Exit"
    echo ""
}

deploy_vercel() {
    echo ""
    echo "========================================"
    echo "Deploying to Vercel"
    echo "========================================"
    echo ""
    echo "Prerequisites:"
    echo "- Vercel CLI installed (npm install -g vercel)"
    echo "- Git repository initialized"
    echo "- MongoDB Atlas connection string ready"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    echo "Installing dependencies..."
    npm install
    echo ""
    echo "Deploying to Vercel..."
    vercel
    echo ""
    echo "Deployment complete! Follow the prompts to set environment variables."
    echo "Don't forget to add MONGO_URI and JWT_SECRET in Vercel dashboard."
    read -p "Press Enter to continue..."
}

deploy_render() {
    echo ""
    echo "========================================"
    echo "Deploying to Render"
    echo "========================================"
    echo ""
    echo "Steps to deploy on Render:"
    echo "1. Push your code to GitHub"
    echo "2. Go to https://dashboard.render.com"
    echo "3. Click 'New +' and select 'Web Service'"
    echo "4. Connect your GitHub repository"
    echo "5. Use these settings:"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "6. Add environment variables:"
    echo "   - MONGO_URI (your MongoDB connection string)"
    echo "   - JWT_SECRET (a secure random string)"
    echo "   - NODE_ENV=production"
    echo ""
    echo "render.yaml file is already configured for you!"
    echo ""
    read -p "Press Enter to continue..."
}

deploy_railway() {
    echo ""
    echo "========================================"
    echo "Deploying to Railway"
    echo "========================================"
    echo ""
    echo "Prerequisites:"
    echo "- Railway CLI installed (npm install -g @railway/cli)"
    echo "- Git repository initialized"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    echo "Logging into Railway..."
    railway login
    echo ""
    echo "Initializing Railway project..."
    railway init
    echo ""
    echo "Setting environment variables..."
    read -p "Enter your MongoDB URI: " mongo_uri
    railway variables set MONGO_URI="$mongo_uri"
    echo ""
    read -p "Enter your JWT secret: " jwt_secret
    railway variables set JWT_SECRET="$jwt_secret"
    railway variables set NODE_ENV=production
    echo ""
    echo "Deploying to Railway..."
    railway up
    echo ""
    echo "Deployment complete!"
    read -p "Press Enter to continue..."
}

deploy_heroku() {
    echo ""
    echo "========================================"
    echo "Deploying to Heroku"
    echo "========================================"
    echo ""
    echo "Prerequisites:"
    echo "- Heroku CLI installed"
    echo "- Git repository initialized"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    echo "Logging into Heroku..."
    heroku login
    echo ""
    echo "Creating Heroku app..."
    heroku create house-renting-system
    echo ""
    echo "Setting environment variables..."
    read -p "Enter your MongoDB URI: " mongo_uri
    heroku config:set MONGO_URI="$mongo_uri"
    echo ""
    read -p "Enter your JWT secret: " jwt_secret
    heroku config:set JWT_SECRET="$jwt_secret"
    heroku config:set NODE_ENV=production
    echo ""
    echo "Deploying to Heroku..."
    git push heroku main
    echo ""
    echo "Opening app in browser..."
    heroku open
    echo ""
    echo "Deployment complete!"
    read -p "Press Enter to continue..."
}

deploy_docker() {
    echo ""
    echo "========================================"
    echo "Building and Running Docker Container"
    echo "========================================"
    echo ""
    echo "Prerequisites:"
    echo "- Docker installed and running"
    echo "- MongoDB Atlas connection string ready"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    echo "Building Docker image..."
    docker build -t house-renting-system .
    echo ""
    read -p "Enter your MongoDB URI: " mongo_uri
    echo ""
    read -p "Enter your JWT secret: " jwt_secret
    echo ""
    echo "Running Docker container..."
    docker run -d \
        -p 5000:5000 \
        -e MONGO_URI="$mongo_uri" \
        -e JWT_SECRET="$jwt_secret" \
        --name house-renting-system \
        house-renting-system
    echo ""
    echo "Container started! Access the app at http://localhost:5000"
    echo ""
    echo "To view logs: docker logs house-renting-system"
    echo "To stop: docker stop house-renting-system"
    echo "To remove: docker rm house-renting-system"
    read -p "Press Enter to continue..."
}

deploy_docker_compose() {
    echo ""
    echo "========================================"
    echo "Running with Docker Compose"
    echo "========================================"
    echo ""
    echo "Prerequisites:"
    echo "- Docker and Docker Compose installed"
    echo ""
    echo "This will start both the app and a local MongoDB instance."
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    echo "Creating .env file for Docker Compose..."
    cat > .env.docker << EOF
MONGO_URI=mongodb://mongodb:27017/renthub
JWT_SECRET=your-secret-key-change-in-production
EOF
    echo ""
    echo "Starting services with Docker Compose..."
    docker-compose --env-file .env.docker up -d
    echo ""
    echo "Services started! Access the app at http://localhost:5000"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
    echo "To stop and remove volumes: docker-compose down -v"
    read -p "Press Enter to continue..."
}

check_dependencies() {
    echo ""
    echo "========================================"
    echo "Checking Dependencies"
    echo "========================================"
    echo ""
    
    echo "Checking Node.js..."
    if command -v node &> /dev/null; then
        echo "✓ Node.js is installed: $(node --version)"
    else
        echo "✗ Node.js is NOT installed. Please install from https://nodejs.org"
    fi
    echo ""
    
    echo "Checking npm..."
    if command -v npm &> /dev/null; then
        echo "✓ npm is installed: $(npm --version)"
    else
        echo "✗ npm is NOT installed."
    fi
    echo ""
    
    echo "Checking Git..."
    if command -v git &> /dev/null; then
        echo "✓ Git is installed: $(git --version)"
    else
        echo "✗ Git is NOT installed. Install from https://git-scm.com"
    fi
    echo ""
    
    echo "Checking Docker..."
    if command -v docker &> /dev/null; then
        echo "✓ Docker is installed: $(docker --version)"
    else
        echo "✗ Docker is NOT installed. Install from https://docker.com"
    fi
    echo ""
    
    echo "Checking Vercel CLI..."
    if command -v vercel &> /dev/null; then
        echo "✓ Vercel CLI is installed: $(vercel --version)"
    else
        echo "✗ Vercel CLI is NOT installed. Install with: npm install -g vercel"
    fi
    echo ""
    
    echo "Checking Heroku CLI..."
    if command -v heroku &> /dev/null; then
        echo "✓ Heroku CLI is installed: $(heroku --version)"
    else
        echo "✗ Heroku CLI is NOT installed. Install from https://devcenter.heroku.com/articles/heroku-cli"
    fi
    echo ""
    
    echo "Checking Railway CLI..."
    if command -v railway &> /dev/null; then
        echo "✓ Railway CLI is installed: $(railway --version)"
    else
        echo "✗ Railway CLI is NOT installed. Install with: npm install -g @railway/cli"
    fi
    echo ""
    
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1) deploy_vercel ;;
        2) deploy_render ;;
        3) deploy_railway ;;
        4) deploy_heroku ;;
        5) deploy_docker ;;
        6) deploy_docker_compose ;;
        7) check_dependencies ;;
        8) 
            echo ""
            echo "Thank you for using the deployment helper!"
            echo "For detailed instructions, see DEPLOYMENT.md"
            echo ""
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            sleep 2
            ;;
    esac
done
