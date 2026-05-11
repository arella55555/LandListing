Install Frontend Dependencies: 
cd frontend

npm install axios

npm install @react-navigation/native
npm install @react-navigation/native-stack

npx expo install react-native-screens
npx expo install react-native-safe-area-context
npx expo install react-native-gesture-handler
npx expo install react-native-reanimated

npm install react-native-paper
npm install @react-native-async-storage/async-storage

cd backend
npm init -y
install Backend Dependencies
npm install express cors dotenv pg bcryptjs jsonwebtoken multer
npm install typescript ts-node-dev @types/node --save-dev

npm install @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer --save-dev

npx tsc --init

Inside backend/package.json:
"scripts": {
  "dev": "ts-node-dev --respawn server.ts"
}

npm install dotenv
npm i --save-dev @types/pg

# Postgresql
Install and open pgAdmin

Steps:
- Right-click Servers
- Click Register → Server
- Set name (e.g. Local PostgreSQL)
- Go to Connection tab
Set:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: (your password)
- Click Save

# Create database
under your created Server, right-click databases
Click Create → Database
Set Database to landlisting_db

# make .env on backend/
paste below and change accordingly

DB_USER=postgres
DB_HOST=localhost
DB_NAME=landlisting_db
DB_PASSWORD=your_password_here
DB_PORT=5432

JWT_SECRET=your_secret_here (ignore this for now)


# Do ipconfig
Replace YOUR_IP with your ip address in frontend/src/services api.ts

