# PowerShell script to setup environment and wire everything together

Write-Host "🏏 Cricket Website - Full Stack Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if backend .env exists
$backendEnvPath = ".env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "`n❌ Backend .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
# Database - MongoDB Atlas Connection
# Replace with your actual MongoDB connection string from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/ipl-website?retryWrites=true&w=majority

# JWT Secret - Change this to a random string
JWT_SECRET=ipl-website-secret-key-2024

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# UPI Payment Settings
MERCHANT_UPI_ID=merchant@upi
MERCHANT_NAME=TicketNest
"@
    
    $envContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Host "✅ Created .env file at: $backendEnvPath" -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: Edit .env file and add your MongoDB connection string!" -ForegroundColor Yellow
    Write-Host "Get your MongoDB URI from: https://www.mongodb.com/atlas" -ForegroundColor Cyan
    Write-Host "`nFormat: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/ipl-website" -ForegroundColor Gray
} else {
    Write-Host "`n✅ Backend .env file exists" -ForegroundColor Green
}

# Check if node_modules exists in backend
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "`n✅ Backend dependencies installed" -ForegroundColor Green
}

Write-Host "`n🚀 To start the complete stack:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. Terminal 1 - Start Backend:" -ForegroundColor White
Write-Host "   cd d:\cricket-website\backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n2. Terminal 2 - Start Frontend:" -ForegroundColor White
Write-Host "   cd d:\cricket-website" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n📱 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:5000/api" -ForegroundColor Green
Write-Host "   Health Check: http://localhost:5000/api/health" -ForegroundColor Green
