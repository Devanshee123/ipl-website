@"
MONGODB_URI=mongodb+srv://sca23036_db_user:sca23036_db_user@cluster0.ghyveh0.mongodb.net/ipl-matches?retryWrites=true&w=majority
JWT_SECRET=cricket-ticket-secret-key-2024-secure
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MERCHANT_UPI_ID=ticketnest@upi
MERCHANT_NAME=TicketNest
"@ | Out-File -FilePath .env -Encoding utf8
