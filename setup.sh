#!/bin/bash

# Farmer AI Support System - Complete Setup Script
echo "🌾 Setting up Farmer AI Support System..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Setup environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please edit it with your API keys:"
    echo "   - GROQ_API_KEY: Get from https://console.groq.com"
    echo "   - OPENWEATHER_API_KEY: Get from https://openweathermap.org/api"
    echo ""
    read -p "Press Enter after you've added your API keys to .env file..."
fi

# Start database
echo "🗄️ Starting PostgreSQL database..."
docker-compose up -d
sleep 5

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Setup Prisma
echo "🔧 Setting up database schema..."
npm run db:generate
npm run db:push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Setup ML service
echo "🤖 Setting up ML service..."
cd ml-service

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt
deactivate

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "1. Start ML service: cd ml-service && ./start.sh"
echo "2. Start frontend: npm run dev"
echo ""
echo "🌐 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - ML Service: http://localhost:8000"
echo "   - Database: localhost:5432"
echo ""
echo "📚 Check README.md for detailed documentation and troubleshooting."