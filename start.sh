#!/bin/bash

# Magyar Vonatkövető - Startup Script
echo "🚂 Magyar Vonatkövető indítása..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 nincs telepítve. Kérlek telepítsd a Python 3.8+ verziót."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nincs telepítve. Kérlek telepítsd a Node.js 16+ verziót."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm nincs telepítve. Kérlek telepítsd az npm-et."
    exit 1
fi

echo "✅ Függőségek ellenőrizve"

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Python függőségek telepítése..."
    pip3 install -r requirements.txt
fi

# Install Frontend dependencies if package.json exists in frontend directory
if [ -f "frontend/package.json" ]; then
    echo "📦 Frontend függőségek telepítése..."
    cd frontend
    npm install
    cd ..
fi

echo "🚀 Alkalmazás indítása..."

# Function to kill background processes on script exit
cleanup() {
    echo -e "\n🛑 Alkalmazás leállítása..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up trap to call cleanup function on script exit
trap cleanup SIGINT SIGTERM

# Start Backend
echo "🔧 Backend indítása (http://localhost:5000)..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Frontend indítása (http://localhost:3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Alkalmazás sikeresen elindult!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "📋 Elérhető API végpontok:"
echo "   • GET /api/trains - Vonatok listája"
echo "   • GET /api/trains/{id} - Vonat részletei" 
echo "   • GET /api/search?q={query} - Vonat keresés"
echo "   • GET /api/status - Rendszer állapot"
echo ""
echo "⚠️  Nyomj Ctrl+C-t a leállításhoz"
echo ""

# Wait for background processes
wait